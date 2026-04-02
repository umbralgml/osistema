import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

export enum AttributeType {
  STRENGTH = 'STRENGTH',
  INTELLIGENCE = 'INTELLIGENCE',
  DISCIPLINE = 'DISCIPLINE',
}

@Entity('attributes')
@Unique(['userId', 'type'])
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.attributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: AttributeType })
  type: AttributeType;

  @Column({ type: 'int', default: 0 })
  value: number;
}
