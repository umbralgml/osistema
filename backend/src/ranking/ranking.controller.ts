import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RankingService } from './ranking.service';

@ApiTags('ranking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  @ApiOperation({ summary: 'Get global ranking' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getGlobalRanking(@Query('limit') limit?: number) {
    return this.rankingService.getGlobalRanking(limit ? Number(limit) : 50);
  }

  @Get('me')
  @ApiOperation({ summary: "Get current user's rank" })
  async getMyRank(@CurrentUser() user: { id: string }) {
    return this.rankingService.getUserRank(user.id);
  }
}
