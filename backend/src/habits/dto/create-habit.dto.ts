import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  HabitCategory,
  HabitFrequency,
  HabitDifficulty,
} from '../entities/habit.entity';

export class CreateHabitDto {
  @ApiProperty({ example: 'Treinar Muay Thai', description: 'Habit name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Treinar Muay Thai por 1 hora',
    description: 'Habit description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: HabitCategory,
    example: HabitCategory.FITNESS,
    description: 'Habit category',
  })
  @IsEnum(HabitCategory)
  @IsOptional()
  category?: HabitCategory;

  @ApiPropertyOptional({
    enum: HabitFrequency,
    example: HabitFrequency.DAILY,
    description: 'Habit frequency',
  })
  @IsEnum(HabitFrequency)
  @IsOptional()
  frequency?: HabitFrequency;

  @ApiPropertyOptional({
    enum: HabitDifficulty,
    example: HabitDifficulty.MEDIUM,
    description: 'Habit difficulty',
  })
  @IsEnum(HabitDifficulty)
  @IsOptional()
  difficulty?: HabitDifficulty;
}
