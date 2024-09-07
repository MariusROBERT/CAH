import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import { QuestionCardEntity } from './entities/questionCard.entity';
import { AnswerCardEntity } from './entities/answerCard.entity';
let process = require('process');

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // autoLoadEntities: true,
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [AnswerCardEntity, QuestionCardEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      AnswerCardEntity,
      QuestionCardEntity,
    ])
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class DatabaseModule {
}
