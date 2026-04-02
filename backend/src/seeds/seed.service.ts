import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Habit } from '../habits/entities/habit.entity';
import { SYSTEM_HABITS } from './system-habits.seed';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Habit)
    private readonly habitsRepository: Repository<Habit>,
  ) {}

  async onModuleInit() {
    await this.seedSystemHabits();
  }

  private async seedSystemHabits() {
    const existingCount = await this.habitsRepository.count({
      where: { isSystemHabit: true },
    });

    if (existingCount > 0) {
      this.logger.log(`System habits already seeded (${existingCount} found)`);
      return;
    }

    this.logger.log('Seeding system habits...');
    const habits = SYSTEM_HABITS.map((seed) =>
      this.habitsRepository.create(seed),
    );
    await this.habitsRepository.save(habits);
    this.logger.log(`Seeded ${habits.length} system habits`);
  }
}
