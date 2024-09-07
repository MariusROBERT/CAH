import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionCardEntity } from '../database/entities/questionCard.entity';
import { AnswerCardEntity } from '../database/entities/answerCard.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([QuestionCardEntity, AnswerCardEntity]),
    GameModule,
  ],
  providers: [GameGateway],
  controllers: [GameController],
})
export class GameModule {
}
