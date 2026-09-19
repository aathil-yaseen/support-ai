import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
  ) {}

  // ================================
  // CREATE TICKET
  // ================================

  @Post()
  @ApiOperation({
    summary: 'Create a new support ticket',
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  createTicket(
    @Body() createTicketDto: CreateTicketDto,
    @Request() req: any,
  ) {
    return this.ticketsService.createTicket(
      createTicketDto.title,
      createTicketDto.description,
      req.user.userId,
    );
  }

  // ================================
  // AI CLASSIFICATION
  // ================================

  @Post(':id/classify')
  @ApiOperation({
    summary: 'Classify a support ticket using AI',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket classification generated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  @ApiResponse({
    status: 503,
    description: 'AI classification service unavailable',
  })
  classifyTicket(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.ticketsService.classifyTicket(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  // ================================
  // AI SENTIMENT
  // ================================

  @Post(':id/sentiment')
  @ApiOperation({
    summary: 'Analyze ticket sentiment using AI',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Sentiment analysis generated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  @ApiResponse({
    status: 503,
    description: 'AI sentiment service unavailable',
  })
  analyzeSentiment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.ticketsService.analyzeSentiment(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  // ================================
  // AI SUMMARY
  // ================================

  @Post(':id/summarize')
  @ApiOperation({
    summary: 'Generate an AI summary of a ticket',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket summary generated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  @ApiResponse({
    status: 503,
    description: 'AI summary service unavailable',
  })
  summarizeTicket(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.ticketsService.summarizeTicket(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  // ================================
  // AI GENERATED RESPONSE
  // ================================

  @Post(':id/respond')
  @ApiOperation({
    summary: 'Generate an AI support response',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'AI support response generated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  @ApiResponse({
    status: 503,
    description: 'AI response service unavailable',
  })
  generateResponse(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.ticketsService.generateResponse(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  // ================================
  // GET ALL TICKETS
  // ================================

  @Get()
  @ApiOperation({
    summary: 'Get support tickets',
  })
  @ApiResponse({
    status: 200,
    description:
      'Customers receive their own tickets; agents and administrators receive all tickets',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  getAllTickets(
    @Request() req: any,
  ) {
    return this.ticketsService.getAllTickets(
      req.user.userId,
      req.user.role,
    );
  }

  // ================================
  // GET TICKET BY ID
  // ================================

  @Get(':id')
  @ApiOperation({
    summary: 'Get a support ticket by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket details',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description:
      'Customer does not have permission to access this ticket',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  getTicket(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.ticketsService.getTicketById(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  // ================================
  // UPDATE TICKET
  // ================================

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a support ticket',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ticket ID or ticket data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description:
      'Only agents and administrators can update tickets',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  updateTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req: any,
  ) {
    return this.ticketsService.updateTicket(
      id,
      updateTicketDto,
      req.user.userId,
      req.user.role,
    );
  }
}