import { IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteHabitDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the habit to complete',
  })
  @IsUUID()
  habitId: string;

  @ApiPropertyOptional({
    example: 'Treinei pesado hoje!',
    description: 'Optional note about the completion',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
