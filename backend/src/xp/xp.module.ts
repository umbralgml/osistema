import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XpLog } from './entities/xp-log.entity';
import { XpService } from './xp.service';
import { XpController } from './xp.controller';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { Attribute } from '../users/entities/attribute.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([XpLog, User, Attribute]),
    forwardRef(() => UsersModule),
  ],
  controllers: [XpController],
  providers: [XpService],
  exports: [XpService],
})
export class XpModule {}
