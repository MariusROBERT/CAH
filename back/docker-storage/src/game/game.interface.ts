import { QuestionCardEntity } from '../database/entities/questionCard.entity';
import { AnswerCardEntity } from '../database/entities/answerCard.entity';

export interface Game {
  code: string,
  users: User[],
  ownerId: string | undefined,
  started: boolean,
  askerId: string,
  answerCards: AnswerCardEntity[],
  questionCards: QuestionCardEntity[],
  question: QuestionCardEntity | undefined,
}

export interface User {
  id: string,
  name: string,
  score: number,
  cardList: AnswerCardEntity[],
  playedCard: AnswerCardEntity[],
}


