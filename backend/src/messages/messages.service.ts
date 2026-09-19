import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(
    content: string,
    userId: number,
    ticketId: number,
  ) {
    return this.prisma.message.create({
      data: {
        content,
        userId,
        ticketId,
      },
    });
  }

  async getTicketMessages(ticketId: number) {
    return this.prisma.message.findMany({
      where: {
        ticketId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}