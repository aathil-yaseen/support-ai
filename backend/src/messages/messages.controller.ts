import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';


@UseGuards(JwtGuard)
@Controller('tickets')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
  ) {}

  @Post(':id/messages')
createMessage(
  @Param('id') id: string,
  @Body() createMessageDto: CreateMessageDto,
  @Request() req: any,
) {
  return this.messagesService.createMessage(
    createMessageDto.content,
    req.user.userId,
    Number(id),
  );
}

  @Get(':id/messages')
  getTicketMessages(@Param('id') id: string) {
    return this.messagesService.getTicketMessages(
      Number(id),
    );
  }
}