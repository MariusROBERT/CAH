import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('answerCard')
export class AnswerCardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;
}
