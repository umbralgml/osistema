import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum HabitCategory {
  FITNESS = 'FITNESS',
  STUDY = 'STUDY',
  MENTAL = 'MENTAL',
  DISCIPLINE = 'DISCIPLINE',
  SOCIAL = 'SOCIAL',
  HEALTH = 'HEALTH',
  CUSTOM = 'CUSTOM',
}

export enum HabitFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export enum HabitDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  LEGENDARY = 'LEGENDARY',
}

export enum AttributeType {
  STRENGTH = 'STRENGTH',
  INTELLIGENCE = 'INTELLIGENCE',
  DISCIPLINE = 'DISCIPLINE',
}

@Entity('habits')
export class Habit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: HabitCategory, default: HabitCategory.CUSTOM })
  category: HabitCategory;

  @Column({ type: 'enum', enum: HabitFrequency, default: HabitFrequency.DAILY })
  frequency: HabitFrequency;

  @Column({ type: 'int', default: 50 })
  xpReward: number;

  @Column({ type: 'enum', enum: AttributeType, default: AttributeType.DISCIPLINE })
  attributeType: AttributeType;

  @Column({ type: 'int', default: 5 })
  attributeReward: number;

  @Column({ type: 'boolean', default: false })
  isSystemHabit: boolean;

  @Column({ type: 'enum', enum: HabitDifficulty, default: HabitDifficulty.MEDIUM })
  difficulty: HabitDifficulty;

  @Column({ type: 'varchar', nullable: true })
  iconName: string | null;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.habits, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('HabitLog', 'habit')
  habitLogs: any[];
}
