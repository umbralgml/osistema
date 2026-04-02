import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Habit } from './habit.entity';
import { User } from '../../users/entities/user.entity';

@Entity('habit_logs')
export class HabitLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  habitId: string;

  @ManyToOne(() => Habit, (habit) => habit.habitLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'habitId' })
  habit: Habit;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.habitLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  completedAt: Date;

  @Column({ type: 'int' })
  xpEarned: number;

  @Column({ type: 'varchar', nullable: true })
  note: string | null;
}
