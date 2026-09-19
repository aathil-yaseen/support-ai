import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../generated/prisma/client';

import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { KnowledgeService } from './knowledge.service';
import { SearchKnowledgeDto } from './dto/search-knowledge.dto';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('knowledge')
export class KnowledgeController {
  constructor(
    private readonly knowledgeService: KnowledgeService,
  ) {}

  // ADMIN + AGENT can add knowledge documents
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @Post('documents')
  createDocument(
    @Body() createKnowledgeDto: CreateKnowledgeDto,
  ) {
    return this.knowledgeService.createDocument(
      createKnowledgeDto.title,
      createKnowledgeDto.content,
      createKnowledgeDto.source,
    );
  }

  // ADMIN + AGENT + CUSTOMER can view knowledge documents
  @Get('documents')
  getDocuments() {
    return this.knowledgeService.getDocuments();
  }

  // Any authenticated user can search knowledge
  @Post('search')
  searchKnowledge(
    @Body() searchKnowledgeDto: SearchKnowledgeDto,
  ) {
    return this.knowledgeService.searchKnowledge(
      searchKnowledgeDto.query,
    );
  }
}