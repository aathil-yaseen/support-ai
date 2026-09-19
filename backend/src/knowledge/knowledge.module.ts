import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HttpModule,
  ],
  controllers: [
    KnowledgeController,
  ],
  providers: [
    KnowledgeService,
  ],
  exports: [
    KnowledgeService,
  ],
})
export class KnowledgeModule {}