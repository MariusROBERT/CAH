import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Game } from './game.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionCardEntity } from '../database/entities/questionCard.entity';
import { Repository } from 'typeorm';
import { AnswerCardEntity } from '../database/entities/answerCard.entity';

@WebSocketGateway(3003, { cors: '*' })
export class GameGateway {
  constructor(
    @InjectRepository(QuestionCardEntity)
    private questionCardRepository: Repository<QuestionCardEntity>,
    @InjectRepository(AnswerCardEntity)
    private answercardRepository: Repository<AnswerCardEntity>,
  ) {
  }

  private games: Game[] = [];

  @WebSocketServer()
  server: Server;

  findGameByCode(code: string): Game | undefined {
    return this.games.find(game => game.code === code);
  }

  findUserById(game: Game, id: string) {
    return game.users.find((user) => user.id === id);
  }

  filterGame(game: Game) {
    const { answerCards, questionCards, users, ...filteredGame } = game;
    const filteredUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      score: user.score,
    }))
    return {users: filteredUsers, ...filteredGame}
  }

  private logger = new Logger('GameGateway');

  //TODO
  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
    this.server.emit('message', message);
  }

  //TODO
  @SubscribeMessage('play')
  playCards(@MessageBody() message) {
    this.logger.log(message);
  }

  @SubscribeMessage('checkGame')
  checkGame(@MessageBody() payload: {
    id: string,
    code: string,
  }): void {
    console.log('0 ' + payload);
    // console.log('1 ' +this.games[0].code);
    // console.log('2 ' + payload.code);
    const game = this.games.find(game => game.code === payload.code);
    console.log(game);
    if (!game) {
      console.log('not found');
      this.server.to(payload.id).emit('error', 'not found');
    } else {
      console.log('found');
      console.log(game);
      this.server.to(payload.id).emit('join', game);
    }
  }

  @SubscribeMessage('create')
  createGame(@MessageBody() paylod: { id: string }) /*: { code: string } | { error: string }*/ {
    console.log('create called');
    let code: string;
    let tries = 0;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      tries++;
    } while (this.findGameByCode(code) || tries > 1000);
    console.log('created');
    if (tries > 1000) {
      this.server.to(paylod.id).emit('error', 'too many tries');
      // return ({ error: 'too many tries' });

    } else {
      this.games.push({
        code,
        users: [],
        ownerId: undefined,
        started: false,
        askerId: undefined,
        questionCards: [],
        answerCards: [],
        question: undefined
      });
      console.log(this.games);
      this.server.to(paylod.id).emit('create', code);
      // return ({ code });
    }
  }

  @SubscribeMessage('join')
  joinGame(@MessageBody() payload: { id: string, code: string, name: string }): void {
    console.log('join');
    if (!payload.name)
      payload.name = payload.id;
    const game = this.findGameByCode(payload.code);
    if (game) {
      const user = game.users.find((user) => user.id === payload.id);
      if (user) {
        user.name = payload.name;
        this.server.emit(game.code, { event: 'game', game: this.filterGame(game) });
      } else {
        game.users.push({
          name: payload.name,
          id: payload.id,
          score: 0,
          cardList: [],
          playedCard: [],
        });
        if (!game.ownerId)
          game.askerId = game.ownerId = payload.id;
        this.server.emit(game.code, { event: 'game', game: this.filterGame(game) });
      }
    } else {
      this.server.to(payload.id).emit('error', 'not found');
    }
    console.log(this.games);
  }

  @SubscribeMessage('start')
  startGame(@MessageBody() payload: { id: string, code: string }) {
    console.log('startGame');
    const game = this.findGameByCode(payload.code);
    if (game) {
      if (game.ownerId === payload.id) {
        game.started = true;
        //get all question cards
        this.questionCardRepository.find().then((questionCards) => {
          game.questionCards = questionCards;
        });
        this.answercardRepository.find().then((answerCards) => {
          game.answerCards = answerCards;
        });

        for (const user of game.users) {
          for (let i = 0; i < 7; i++) {
            const pickedCard = game.answerCards[Math.floor(Math.random() * game.answerCards.length)]
            game.answerCards = game.answerCards.filter((card) => card.id != pickedCard.id);
            user.cardList.push(pickedCard);
          }
        }

        {
          const pickedCard = game.questionCards[Math.floor(Math.random() * game.questionCards.length)];
          game.questionCards = game.questionCards.filter((card) => card.id != pickedCard.id);
          game.question = pickedCard;
        }
        this.server.emit(game.code, { event: 'game', game: this.filterGame(game) });
        for (const user of game.users) {
          this.server.to(user.id).emit('cards', this.findUserById(game, user.id).cardList);
        }
      } else
        this.server.to(payload.id).emit('error', 'not owner');
    } else {
      this.server.to(payload.id).emit('error', 'not found');
    }
  }
}
