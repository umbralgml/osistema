import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Attribute, AttributeType } from './entities/attribute.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Attribute)
    private readonly attributesRepository: Repository<Attribute>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existingEmail = await this.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername = await this.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('Username already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = this.usersRepository.create({
      ...dto,
      password: hashedPassword,
      objectives: dto.objectives ?? [],
    });

    const savedUser = await this.usersRepository.save(user);

    // Create default attributes for the new user
    const defaultAttributes = Object.values(AttributeType).map((type) =>
      this.attributesRepository.create({
        userId: savedUser.id,
        type,
        value: 0,
      }),
    );
    await this.attributesRepository.save(defaultAttributes);

    return savedUser;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async getProfile(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['attributes'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateStreak(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastActivityDate) {
      const lastActivity = new Date(user.lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - lastActivity.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        // Consecutive day — increment streak
        user.streak += 1;
      } else if (diffDays > 1) {
        // Streak broken — reset
        user.streak = 1;
      }
      // diffDays === 0 means same day, streak unchanged
    } else {
      // First activity ever
      user.streak = 1;
    }

    if (user.streak > user.longestStreak) {
      user.longestStreak = user.streak;
    }

    user.lastActivityDate = today;

    return this.usersRepository.save(user);
  }

  getLevelInfo(level: number): { currentLevel: number; nextLevelXp: number } {
    const nextLevelXp = Math.floor(100 * Math.pow(level, 1.5));
    return { currentLevel: level, nextLevelXp };
  }
}
