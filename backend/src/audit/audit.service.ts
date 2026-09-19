import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(
    action: string,
    userId?: number,
    details?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        action,
        userId,
        details,
      },
    });
  }
}