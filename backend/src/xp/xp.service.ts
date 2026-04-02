import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { XpLog } from './entities/xp-log.entity';
import { User } from '../users/entities/user.entity';
import { Attribute, AttributeType } from '../users/entities/attribute.entity';

@Injectable()
export class XpService {
  constructor(
    @InjectRepository(XpLog)
    private readonly xpLogRepository: Repository<XpLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
  ) {}

  async awardXp(
    userId: string,
    amount: number,
    source: string,
    description?: string,
  ): Promise<{
    totalXpAwarded: number;
    newLevel: number;
    leveledUp: boolean;
    newTitle: string;
  }> {
    // Create XP log entry
    const xpLog = this.xpLogRepository.create({
      userId,
      amount,
      source,
      description: description ?? null,
    });
    await this.xpLogRepository.save(xpLog);

    // Update user XP
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });

    user.currentXp += amount;
    user.totalXp += amount;

    let leveledUp = false;
    let xpForNextLevel = this.getXpForLevel(user.level);

    // Check for level up (possibly multiple levels)
    while (user.currentXp >= xpForNextLevel) {
      user.currentXp -= xpForNextLevel;
      user.level += 1;
      leveledUp = true;
      xpForNextLevel = this.getXpForLevel(user.level);
    }

    // Update title based on level
    user.title = this.getTitleForLevel(user.level);

    await this.userRepository.save(user);

    // Update attribute value based on source
    await this.updateAttributeFromSource(userId, source);

    return {
      totalXpAwarded: amount,
      newLevel: user.level,
      leveledUp,
      newTitle: user.title,
    };
  }

  getTitles(): Record<string, string> {
    return {
      '1-5': 'Novato',
      '6-10': 'Aprendiz',
      '11-20': 'Guerreiro',
      '21-30': 'Elite',
      '31-50': 'Mestre',
      '51-75': 'Campeão',
      '76-99': 'Lenda',
      '100': 'Monarca',
    };
  }

  getTitleForLevel(level: number): string {
    if (level >= 100) return 'Monarca';
    if (level >= 76) return 'Lenda';
    if (level >= 51) return 'Campeão';
    if (level >= 31) return 'Mestre';
    if (level >= 21) return 'Elite';
    if (level >= 11) return 'Guerreiro';
    if (level >= 6) return 'Aprendiz';
    return 'Novato';
  }

  async getXpHistory(userId: string, limit = 20): Promise<XpLog[]> {
    return this.xpLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  getXpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  private async updateAttributeFromSource(
    userId: string,
    source: string,
  ): Promise<void> {
    const sourceToAttribute: Record<string, AttributeType> = {
      habit_completion: AttributeType.DISCIPLINE,
      streak_bonus: AttributeType.DISCIPLINE,
      mission_complete: AttributeType.STRENGTH,
    };

    const attributeType = sourceToAttribute[source];
    if (!attributeType) return;

    let attribute = await this.attributeRepository.findOne({
      where: { userId, type: attributeType },
    });

    if (!attribute) {
      attribute = this.attributeRepository.create({
        userId,
        type: attributeType,
        value: 0,
      });
    }

    attribute.value += 1;
    await this.attributeRepository.save(attribute);
  }
}
