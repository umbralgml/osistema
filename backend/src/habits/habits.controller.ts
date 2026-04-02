import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('habits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all habits for the current user (system + custom)' })
  @ApiResponse({ status: 200, description: 'List of habits returned' })
  async getAllHabits(@CurrentUser() user: { id: string }) {
    return this.habitsService.getAllUserHabits(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom habit' })
  @ApiResponse({ status: 201, description: 'Habit created successfully' })
  async createHabit(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateHabitDto,
  ) {
    return this.habitsService.createHabit(user.id, dto);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete a habit' })
  @ApiResponse({
    status: 201,
    description: 'Habit completed, XP awarded',
  })
  @ApiResponse({ status: 400, description: 'Habit already completed today' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  async completeHabit(
    @CurrentUser() user: { id: string },
    @Body() dto: CompleteHabitDto,
  ) {
    return this.habitsService.completeHabit(user.id, dto.habitId, dto.note);
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's habit completions" })
  @ApiResponse({ status: 200, description: "Today's completions returned" })
  async getToday(@CurrentUser() user: { id: string }) {
    return this.habitsService.getCompletionsToday(user.id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get stats for a specific habit' })
  @ApiResponse({ status: 200, description: 'Habit stats returned' })
  @ApiResponse({ status: 404, description: 'Habit not found' })
  async getHabitStats(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.habitsService.getHabitStats(user.id, id);
  }
}
