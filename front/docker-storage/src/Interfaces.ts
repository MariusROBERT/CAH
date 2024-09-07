export default interface GameInterface {
  code: string,
  users: User[],
  ownerId: string | undefined,
  started: boolean,
  askerId: string,
  question: QuestionCard | undefined,
}

export interface QuestionCard {
  id: number,
  text: string,
  answer: number,
}

export interface AnswerCardInterface {
  id: number,
  text: string,
}

export interface User {
  id: string,
  name: string,
  score: number,
}

