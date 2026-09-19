import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { KnowledgeService } from '../knowledge/knowledge.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly auditService: AuditService,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  // CREATE TICKET
  async createTicket(
    title: string,
    description: string,
    userId: number,
  ) {
    const ticket = await this.prisma.ticket.create({
      data: {
        title,
        description,
        userId,
      },
    });

    await this.auditService.log(
      'TICKET_CREATED',
      userId,
      `Ticket created: ${ticket.id}`,
    );

    return ticket;
  }

  // GET TICKETS
  async getAllTickets(
    userId: number,
    role: string,
  ) {
    // Customers can only see their own tickets
    if (role === 'CUSTOMER') {
      return this.prisma.ticket.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // ADMIN and AGENT can see all tickets
    return this.prisma.ticket.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // GET TICKET BY ID
  async getTicketById(
    ticketId: number,
    userId: number,
    role: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        messages: true,
        aiAnalyses: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket not found',
      );
    }

    // Customer can only access own ticket
    if (
      role === 'CUSTOMER' &&
      ticket.userId !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to access this ticket',
      );
    }

    return ticket;
  }

  // UPDATE TICKET
  async updateTicket(
    id: number,
    data: {
      title?: string;
      description?: string;
      status?: any;
      priority?: any;
    },
    userId: number,
    role: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: {
        id,
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket not found',
      );
    }

    // Only ADMIN and AGENT can update tickets
    if (
      role !== 'ADMIN' &&
      role !== 'AGENT'
    ) {
      throw new ForbiddenException(
        'Only agents and administrators can update tickets',
      );
    }

    const updatedTicket =
      await this.prisma.ticket.update({
        where: {
          id,
        },
        data,
      });

    await this.auditService.log(
      'TICKET_UPDATED',
      userId,
      `Ticket updated: ${id}`,
    );

    return updatedTicket;
  }

  // AI CLASSIFICATION
  async classifyTicket(
    id: number,
    userId: number,
    role: string,
  ) {
    const ticket =
      await this.getTicketById(
        id,
        userId,
        role,
      );

    let response;

    try {
      response = await firstValueFrom(
        this.httpService.post(
          'http://127.0.0.1:8000/ai/classify',
          {
            title: ticket.title,
            description: ticket.description,
          },
        ),
      );
    } catch (error) {
      console.error(
        'AI classification service error:',
        error,
      );

      throw new ServiceUnavailableException(
        'AI classification service is currently unavailable',
      );
    }

    const aiResult = response.data;

    const analysis =
      await this.prisma.aIAnalysis.create({
        data: {
          type: 'CLASSIFICATION',
          result: aiResult.category,
          confidence: aiResult.confidence,
          ticketId: id,
        },
      });

    await this.auditService.log(
      'AI_CLASSIFICATION',
      userId,
      `AI classification generated for ticket ${id}`,
    );

    return analysis;
  }

  // AI SENTIMENT
  async analyzeSentiment(
    id: number,
    userId: number,
    role: string,
  ) {
    const ticket =
      await this.getTicketById(
        id,
        userId,
        role,
      );

    let response;

    try {
      response = await firstValueFrom(
        this.httpService.post(
          'http://127.0.0.1:8000/ai/sentiment',
          {
            title: ticket.title,
            description: ticket.description,
          },
        ),
      );
    } catch (error) {
      console.error(
        'AI sentiment service error:',
        error,
      );

      throw new ServiceUnavailableException(
        'AI sentiment service is currently unavailable',
      );
    }

    const aiResult = response.data;

    const analysis =
      await this.prisma.aIAnalysis.create({
        data: {
          type: 'SENTIMENT',
          result: aiResult.sentiment,
          confidence: aiResult.confidence,
          ticketId: id,
        },
      });

    await this.auditService.log(
      'AI_SENTIMENT',
      userId,
      `AI sentiment analysis generated for ticket ${id}`,
    );

    return analysis;
  }

  // AI SUMMARY
  async summarizeTicket(
    id: number,
    userId: number,
    role: string,
  ) {
    const ticket =
      await this.getTicketById(
        id,
        userId,
        role,
      );

    let response;

    try {
      response = await firstValueFrom(
        this.httpService.post(
          'http://127.0.0.1:8000/ai/summarize',
          {
            title: ticket.title,
            description: ticket.description,
          },
        ),
      );
    } catch (error) {
      console.error(
        'AI summary service error:',
        error,
      );

      throw new ServiceUnavailableException(
        'AI summary service is currently unavailable',
      );
    }

    const aiResult = response.data;

    const analysis =
      await this.prisma.aIAnalysis.create({
        data: {
          type: 'SUMMARY',
          result: aiResult.summary,
          ticketId: id,
        },
      });

    await this.auditService.log(
      'AI_SUMMARY',
      userId,
      `AI summary generated for ticket ${id}`,
    );

    return analysis;
  }

  // AI RESPONSE + RAG
  async generateResponse(
    ticketId: number,
    userId: number,
    role: string,
  ) {
    const ticket =
      await this.getTicketById(
        ticketId,
        userId,
        role,
      );

    let knowledge;

    try {
      knowledge =
        await this.knowledgeService.retrieveRelevantKnowledge(
          `${ticket.title} ${ticket.description}`,
        );
    } catch (error) {
      console.error(
        'Knowledge retrieval error:',
        error,
      );

      throw new ServiceUnavailableException(
        'Knowledge service is currently unavailable',
      );
    }

    console.log(
      'RAG Knowledge:',
      knowledge,
    );

    const context = knowledge
      .map((item) => item.content)
      .join('\n\n');

    let response;

    try {
      response = await firstValueFrom(
        this.httpService.post(
          'http://127.0.0.1:8000/ai/respond',
          {
            title: ticket.title,
            description: ticket.description,
            context,
          },
        ),
      );
    } catch (error) {
      console.error(
        'AI response service error:',
        error,
      );

      throw new ServiceUnavailableException(
        'AI response service is currently unavailable',
      );
    }

    const aiResult = response.data;

    const analysis =
      await this.prisma.aIAnalysis.create({
        data: {
          type: 'RESPONSE',
          result: aiResult.response,
          confidence: aiResult.confidence,
          ticketId,
        },
      });

    await this.auditService.log(
      'AI_RESPONSE',
      userId,
      `AI response generated for ticket ${ticketId}`,
    );

    return analysis;
  }
}