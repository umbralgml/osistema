#!/bin/bash
set -e

PORTAINER_URL="https://painel.zioncore.com.br"
PORTAINER_USER="admin"
PORTAINER_PASS='1n0v@IN2020!'
STACK_NAME="osistema"

echo "========================================"
echo "  O SISTEMA - Deploy Script"
echo "========================================"

# Step 1: Build the Docker image locally
echo ""
echo "[1/3] Building Docker image..."
docker build -t osistema-api:latest ./backend

# Step 2: Authenticate with Portainer
echo ""
echo "[2/3] Authenticating with Portainer..."
TOKEN=$(curl -sk -X POST "${PORTAINER_URL}/api/auth" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${PORTAINER_USER}\",\"password\":\"${PORTAINER_PASS}\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['jwt'])")

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to authenticate with Portainer"
  exit 1
fi

echo "Getting endpoint ID..."
ENDPOINT_ID=$(curl -sk -H "Authorization: Bearer ${TOKEN}" \
  "${PORTAINER_URL}/api/endpoints" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['Id'])")

# Step 3: Deploy stack
echo ""
echo "[3/3] Deploying stack..."
COMPOSE_CONTENT=$(cat docker-compose.yml)

# Check if stack exists
STACK_ID=$(curl -sk -H "Authorization: Bearer ${TOKEN}" \
  "${PORTAINER_URL}/api/stacks" \
  | python3 -c "
import sys, json
stacks = json.load(sys.stdin)
for s in stacks:
    if s['Name'] == '${STACK_NAME}':
        print(s['Id'])
        break
" 2>/dev/null || echo "")

if [ -n "$STACK_ID" ]; then
  echo "Updating existing stack (ID: ${STACK_ID})..."
  curl -sk -X PUT "${PORTAINER_URL}/api/stacks/${STACK_ID}?endpointId=${ENDPOINT_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"stackFileContent\": $(echo "$COMPOSE_CONTENT" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))'), \"prune\": true}"
else
  echo "Creating new stack..."
  curl -sk -X POST "${PORTAINER_URL}/api/stacks/create/swarm/string?endpointId=${ENDPOINT_ID}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"${STACK_NAME}\",
      \"stackFileContent\": $(echo "$COMPOSE_CONTENT" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')
    }"
fi

echo ""
echo "========================================"
echo "  Deploy complete!"
echo "  API: https://osistema.zioncore.com.br"
echo "  Docs: https://osistema.zioncore.com.br/api/docs"
echo "========================================"
