import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { XpService } from './xp.service';
import { UsersService } from '../users/users.service';

@ApiTags('xp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('xp')
export class XpController {
  constructor(
    private readonly xpService: XpService,
    private readonly usersService: UsersService,
  ) {}

  @Get('history')
  @ApiOperation({ summary: 'Get XP history for current user' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: number,
  ) {
    return this.xpService.getXpHistory(user.id, limit ? Number(limit) : 20);
  }

  @Get('level-info')
  @ApiOperation({ summary: 'Get current level info' })
  async getLevelInfo(@CurrentUser() user: { id: string }) {
    const userData = await this.usersService.findById(user.id);
    const xpForNext = this.xpService.getXpForLevel(userData.level);
    const progress =
      xpForNext > 0
        ? Math.round((userData.currentXp / xpForNext) * 100)
        : 100;

    return {
      level: userData.level,
      currentXp: userData.currentXp,
      xpForNextLevel: xpForNext,
      totalXp: userData.totalXp,
      title: userData.title,
      progressPercentage: progress,
    };
  }
}
