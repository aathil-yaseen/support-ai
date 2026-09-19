import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchKnowledgeDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  query: string;
}