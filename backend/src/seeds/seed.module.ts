import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Habit } from '../habits/entities/habit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Habit])],
  providers: [SeedService],
})
export class SeedModule {}
