import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendXpNotification(userId: string, data: Record<string, any>) {
    this.server.emit('xp_gained', { userId, ...data });
  }

  sendLevelUpNotification(userId: string, data: Record<string, any>) {
    this.server.emit('level_up', { userId, ...data });
  }

  sendStreakNotification(userId: string, streakCount: number) {
    this.server.emit('streak_update', { userId, streakCount });
  }
}
