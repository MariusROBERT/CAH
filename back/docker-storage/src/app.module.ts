import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { QuestionCardEntity } from './database/entities/questionCard.entity';
import { AnswerCardEntity } from './database/entities/answerCard.entity';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([QuestionCardEntity, AnswerCardEntity]),
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
