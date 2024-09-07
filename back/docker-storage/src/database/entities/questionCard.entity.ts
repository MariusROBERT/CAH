import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('questionCard')
export class QuestionCardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  answer: number;
}
