import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getGlobalRanking(
    limit = 50,
  ): Promise<
    {
      rank: number;
      id: string;
      username: string;
      name: string;
      level: number;
      totalXp: number;
      title: string;
    }[]
  > {
    const users = await this.userRepository.find({
      order: { totalXp: 'DESC' },
      take: limit,
      select: ['id', 'username', 'name', 'level', 'totalXp', 'title'],
    });

    return users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      username: user.username,
      name: user.name,
      level: user.level,
      totalXp: user.totalXp,
      title: user.title,
    }));
  }

  async getUserRank(
    userId: string,
  ): Promise<{
    rank: number;
    id: string;
    username: string;
    name: string;
    level: number;
    totalXp: number;
    title: string;
  }> {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: ['id', 'username', 'name', 'level', 'totalXp', 'title'],
    });

    const rank = await this.userRepository
      .createQueryBuilder('user')
      .where('user.totalXp > :totalXp', { totalXp: user.totalXp })
      .getCount();

    return {
      rank: rank + 1,
      id: user.id,
      username: user.username,
      name: user.name,
      level: user.level,
      totalXp: user.totalXp,
      title: user.title,
    };
  }
}
