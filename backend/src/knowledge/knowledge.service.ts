import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Split knowledge content into complete sentences
   * instead of cutting words in the middle.
   */
  private createChunks(
    text: string,
    maxLength = 500,
  ): string[] {
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (
        currentChunk &&
        currentChunk.length + sentence.length + 1 > maxLength
      ) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk = currentChunk
          ? `${currentChunk} ${sentence}`
          : sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Create a knowledge document,
   * generate chunks and embeddings,
   * then store them in pgvector.
   */
  async createDocument(
    title: string,
    content: string,
    source?: string,
  ) {
    const document =
      await this.prisma.knowledgeDocument.create({
        data: {
          title,
          content,
          source,
        },
      });

    const chunks = this.createChunks(content);

    for (const [index, chunk] of chunks.entries()) {
      const response = await firstValueFrom(
        this.httpService.post(
          'http://127.0.0.1:8000/ai/embed',
          {
            text: chunk,
          },
        ),
      );

      const embedding = response.data.embedding;

      const embeddingVector =
        `[${embedding.join(',')}]`;

      await this.prisma.$executeRaw`
        INSERT INTO "DocumentChunk"
          (
            "content",
            "chunkIndex",
            "createdAt",
            "documentId",
            "embedding"
          )
        VALUES
          (
            ${chunk},
            ${index},
            NOW(),
            ${document.id},
            ${embeddingVector}::vector
          )
      `;
    }

    return this.prisma.knowledgeDocument.findUnique({
      where: {
        id: document.id,
      },
      include: {
        chunks: true,
      },
    });
  }

  /**
   * Get all knowledge documents.
   */
  async getDocuments() {
    return this.prisma.knowledgeDocument.findMany({
      include: {
        chunks: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Semantic search using pgvector.
   */
  async searchKnowledge(query: string) {
    const response = await firstValueFrom(
      this.httpService.post(
        'http://127.0.0.1:8000/ai/embed',
        {
          text: query,
        },
      ),
    );

    const embedding = response.data.embedding;

    const queryVector =
      `[${embedding.join(',')}]`;

    const results = await this.prisma.$queryRaw<
      Array<{
        id: number;
        content: string;
        chunkIndex: number;
        documentId: number;
        documentTitle: string;
        similarity: number;
      }>
    >`
      SELECT
        dc.id,
        dc.content,
        dc."chunkIndex",
        dc."documentId",
        kd.title AS "documentTitle",
        1 - (dc.embedding <=> ${queryVector}::vector)
          AS similarity
      FROM "DocumentChunk" dc
      JOIN "KnowledgeDocument" kd
        ON kd.id = dc."documentId"
      WHERE dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> ${queryVector}::vector
      LIMIT 5;
    `;

    return results;
  }

  /**
   * Retrieve relevant knowledge for RAG.
   * Only chunks with similarity >= 0.5 are used.
   */
  async retrieveRelevantKnowledge(query: string) {
    const response = await firstValueFrom(
      this.httpService.post(
        'http://127.0.0.1:8000/ai/embed',
        {
          text: query,
        },
      ),
    );

    const embedding = response.data.embedding;

    const queryVector =
      `[${embedding.join(',')}]`;

    const results = await this.prisma.$queryRaw<
      Array<{
        id: number;
        content: string;
        chunkIndex: number;
        documentId: number;
        documentTitle: string;
        similarity: number;
      }>
    >`
      SELECT
        dc.id,
        dc.content,
        dc."chunkIndex",
        dc."documentId",
        kd.title AS "documentTitle",
        1 - (dc.embedding <=> ${queryVector}::vector)
          AS similarity
      FROM "DocumentChunk" dc
      JOIN "KnowledgeDocument" kd
        ON kd.id = dc."documentId"
      WHERE dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> ${queryVector}::vector
      LIMIT 5;
    `;

    return results.filter(
      (item) => item.similarity >= 0.5,
    );
  }
}