import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Habit, HabitCategory } from './entities/habit.entity';
import { HabitLog } from './entities/habit-log.entity';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private readonly habitsRepository: Repository<Habit>,
    @InjectRepository(HabitLog)
    private readonly habitLogsRepository: Repository<HabitLog>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Maps user objectives (from onboarding) to habit categories.
   */
  private mapObjectivesToCategories(objectives: string[]): HabitCategory[] {
    const mapping: Record<string, HabitCategory> = {
      fitness: HabitCategory.FITNESS,
      exercise: HabitCategory.FITNESS,
      gym: HabitCategory.FITNESS,
      treino: HabitCategory.FITNESS,
      study: HabitCategory.STUDY,
      estudo: HabitCategory.STUDY,
      learn: HabitCategory.STUDY,
      aprender: HabitCategory.STUDY,
      mental: HabitCategory.MENTAL,
      meditation: HabitCategory.MENTAL,
      mindfulness: HabitCategory.MENTAL,
      discipline: HabitCategory.DISCIPLINE,
      disciplina: HabitCategory.DISCIPLINE,
      routine: HabitCategory.DISCIPLINE,
      rotina: HabitCategory.DISCIPLINE,
      social: HabitCategory.SOCIAL,
      health: HabitCategory.HEALTH,
      saude: HabitCategory.HEALTH,
      saude_mental: HabitCategory.MENTAL,
    };

    const categories = new Set<HabitCategory>();
    for (const objective of objectives) {
      const key = objective.toLowerCase().trim();
      if (mapping[key]) {
        categories.add(mapping[key]);
      }
    }

    // If no mapping found, return all categories
    if (categories.size === 0) {
      return Object.values(HabitCategory).filter(
        (c) => c !== HabitCategory.CUSTOM,
      );
    }

    return Array.from(categories);
  }

  /**
   * Returns system habits matching user objectives.
   */
  async getSystemHabits(objectives: string[]): Promise<Habit[]> {
    const categories = this.mapObjectivesToCategories(objectives);

    return this.habitsRepository.find({
      where: categories.map((category) => ({
        isSystemHabit: true,
        category,
        isActive: true,
      })),
    });
  }

  /**
   * Returns user's custom (non-system) habits.
   */
  async getUserHabits(userId: string): Promise<Habit[]> {
    return this.habitsRepository.find({
      where: {
        userId,
        isSystemHabit: false,
        isActive: true,
      },
    });
  }

  /**
   * Returns all habits for a user: system habits (filtered by objectives) + custom habits.
   */
  async getAllUserHabits(userId: string): Promise<Habit[]> {
    const user = await this.usersService.findById(userId);
    const systemHabits = await this.getSystemHabits(user.objectives || []);
    const userHabits = await this.getUserHabits(userId);

    return [...systemHabits, ...userHabits];
  }

  /**
   * Creates a custom habit for a user.
   */
  async createHabit(userId: string, dto: CreateHabitDto): Promise<Habit> {
    const habit = this.habitsRepository.create({
      ...dto,
      userId,
      isSystemHabit: false,
    });

    return this.habitsRepository.save(habit);
  }

  /**
   * Completes a habit for a user.
   * Creates a HabitLog, calculates XP with streak bonus, updates streak.
   */
  async completeHabit(
    userId: string,
    habitId: string,
    note?: string,
  ): Promise<{
    xpEarned: number;
    newLevel: number;
    leveledUp: boolean;
    streakCount: number;
  }> {
    const habit = await this.habitsRepository.findOne({
      where: { id: habitId },
    });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    // Check if already completed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const alreadyCompleted = await this.habitLogsRepository.findOne({
      where: {
        habitId,
        userId,
        completedAt: Between(todayStart, todayEnd),
      },
    });

    if (alreadyCompleted) {
      throw new BadRequestException('Habit already completed today');
    }

    // Get user to calculate streak
    const user = await this.usersService.findById(userId);

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    let currentStreak = user.streak || 0;

    const lastActivity = user.lastActivityDate
      ? new Date(user.lastActivityDate)
      : null;

    if (lastActivity) {
      const lastActivityDay = new Date(lastActivity);
      lastActivityDay.setHours(0, 0, 0, 0);

      const todayDay = new Date();
      todayDay.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (todayDay.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        // Consecutive day, increment streak
        currentStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        currentStreak = 1;
      }
      // diffDays === 0 means already active today, keep streak
    } else {
      // First activity ever
      currentStreak = 1;
    }

    // Calculate XP with streak bonus (+10% per streak day, max 100%)
    const streakMultiplier = Math.min(currentStreak * 0.1, 1.0);
    const baseXp = habit.xpReward;
    const xpEarned = Math.round(baseXp * (1 + streakMultiplier));

    // Create habit log
    const habitLog = this.habitLogsRepository.create({
      habitId,
      userId,
      xpEarned,
      note: note || null,
    });

    await this.habitLogsRepository.save(habitLog);

    // Update user XP and streak
    const previousLevel = user.level;
    const newTotalXp = user.totalXp + xpEarned;
    const newCurrentXp = user.currentXp + xpEarned;

    // Level calculation: each level requires level * 100 XP
    let level = user.level;
    let remainingXp = newCurrentXp;
    const xpForNextLevel = () => level * 100;

    while (remainingXp >= xpForNextLevel()) {
      remainingXp -= xpForNextLevel();
      level += 1;
    }

    const longestStreak = Math.max(user.longestStreak || 0, currentStreak);

    // Update user directly via repository (avoid circular dependency with XpService)
    await this.habitsRepository.manager.getRepository('User').update(userId, {
      currentXp: remainingXp,
      totalXp: newTotalXp,
      level,
      streak: currentStreak,
      longestStreak,
      lastActivityDate: new Date(),
    });

    return {
      xpEarned,
      newLevel: level,
      leveledUp: level > previousLevel,
      streakCount: currentStreak,
    };
  }

  /**
   * Returns today's completions for a user.
   */
  async getCompletionsToday(userId: string): Promise<HabitLog[]> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    return this.habitLogsRepository.find({
      where: {
        userId,
        completedAt: Between(todayStart, todayEnd),
      },
      relations: ['habit'],
    });
  }

  /**
   * Returns completion history/stats for a specific habit.
   */
  async getHabitStats(
    userId: string,
    habitId: string,
  ): Promise<{
    totalCompletions: number;
    currentWeekCompletions: number;
    lastCompleted: Date | null;
    logs: HabitLog[];
  }> {
    const habit = await this.habitsRepository.findOne({
      where: { id: habitId },
    });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    const logs = await this.habitLogsRepository.find({
      where: { habitId, userId },
      order: { completedAt: 'DESC' },
    });

    // Current week completions
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const currentWeekCompletions = logs.filter(
      (log) => new Date(log.completedAt) >= startOfWeek,
    ).length;

    return {
      totalCompletions: logs.length,
      currentWeekCompletions,
      lastCompleted: logs.length > 0 ? logs[0].completedAt : null,
      logs,
    };
  }
}
