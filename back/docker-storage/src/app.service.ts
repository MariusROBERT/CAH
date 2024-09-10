import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionCardEntity } from './database/entities/questionCard.entity';
import { AnswerCardEntity } from './database/entities/answerCard.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(QuestionCardEntity)
    private questionCardRepository: Repository<QuestionCardEntity>,
    @InjectRepository(AnswerCardEntity)
    private answercardRepository: Repository<AnswerCardEntity>,
  ) {
  }

  addQuestion(question: string, answerNumber: number): void {
    this.questionCardRepository.insert({
      text: question,
      answer: answerNumber,
    }).then();
  }

  addAnswer(answer: string): void {
    this.answercardRepository.insert({
      text: answer,
    }).then();
  }


  getHello(): string {
    return 'Hello World!';
  }

  async addBulkQuestion(data: { text: string; answer: number }[]) {
    return this.questionCardRepository.insert(data);
  }

  async addBulkAnswer(data: { text: string }[]) {
    return this.answercardRepository.insert(data);
  }
}
