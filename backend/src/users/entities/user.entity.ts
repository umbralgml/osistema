import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Attribute } from './attribute.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'decimal', nullable: true })
  height: number | null;

  @Column({ type: 'decimal', nullable: true })
  weight: number | null;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  currentXp: number;

  @Column({ type: 'int', default: 0 })
  totalXp: number;

  @Column({ type: 'varchar', default: 'Novato' })
  title: string;

  @Column({ type: 'jsonb', nullable: true })
  avatarConfig: Record<string, any> | null;

  @Column({ type: 'text', array: true, default: '{}' })
  objectives: string[];

  @Column({ type: 'int', default: 0 })
  streak: number;

  @Column({ type: 'int', default: 0 })
  longestStreak: number;

  @Column({ type: 'date', nullable: true })
  lastActivityDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Attribute, (attribute) => attribute.user)
  attributes: Attribute[];

  // Relation stubs — entities defined in their respective modules
  @OneToMany('HabitLog', 'user')
  habitLogs: any[];

  @OneToMany('XpLog', 'user')
  xpLogs: any[];

  @OneToMany('Habit', 'user')
  habits: any[];
}
