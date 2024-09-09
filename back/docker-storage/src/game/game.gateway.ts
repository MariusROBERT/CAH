import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Game, User } from './game.interface';
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

  findCardById(user: User, id: number) {
    return user.cardList.find((card) => card.id === id);
  }

  listWaitingUsers(game: Game) {
    return (game.users
      .filter((user) => user.playedCard.length !== game.question.answer && user.id !== game.askerId)
      .map((user) => ({ id: user.id, name: user.name })));
  }

  findUserFromCard(game: Game, cardId: number) {
    return (game.users.find((user) => user.playedCard.find((userCard) => userCard.id === cardId)));
  }

  filterGame(game: Game) {
    const { answerCards, questionCards, users, ...filteredGame } = game;
    const filteredUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      score: user.score,
    }));
    return { users: filteredUsers, ...filteredGame };
  }

  newRound(game: Game) {
    game.question = game.questionCards[Math.floor(Math.random() * game.questionCards.length)];
    game.questionCards = game.questionCards.filter((card) => card.id != game.question.id);
    game.users.forEach((user) => {
      while (user.cardList.length < 7) {
        const pickedCard = game.answerCards[Math.floor(Math.random() * game.answerCards.length)];
        game.answerCards = game.answerCards.filter((card) => card.id != pickedCard.id);
        user.cardList.push(pickedCard);
      }
      user.playedCard = [];
    });
  }

  @SubscribeMessage('play')
  playCards(@MessageBody() payload: { code: string, id: string, cards: number[] }) {
    const game = this.findGameByCode(payload.code);
    const user = this.findUserById(game, payload.id);

    if (user.id === game.askerId) {
      this.server.to(payload.id).emit('error', 'you can\'t play cards');
      return;
    }
    const playedCards = payload.cards.map((card) => this.findCardById(user, card));
    if (playedCards.find((card) => !card)) {
      this.server.to(payload.id).emit('error', 'invalid card');
      return;
    }

    user.cardList = user.cardList.filter((card) => !payload.cards.includes(card.id));
    user.playedCard = playedCards;
    const waitingUsers = this.listWaitingUsers(game);
    if (waitingUsers.length === 0) {
      const finalCards = game.users
        .filter((user) => user.id !== game.askerId)
        .map((user) => user.playedCard);

      for (let i = finalCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalCards[i], finalCards[j]] = [finalCards[j], finalCards[i]];
      }

      this.server.emit(payload.code, {
        event: 'voting',
        cards: finalCards,
      });
    } else
      this.server.emit(payload.code, {
        event: 'waiting',
        waiting: waitingUsers,
      });
  }

  @SubscribeMessage('vote')
  vote(@MessageBody() payload: {
    id: string,
    code: string,
    card: number
  }) {
    const game = this.findGameByCode(payload.code);
    if (payload.id === game.askerId) {
      const winner = this.findUserFromCard(game, payload.card);
      if (winner) {
        console.log('winner: ' + winner.name);
        winner.score++;
        game.askerId = winner.id;

        if (winner.score >= 1) {
          this.server.emit(game.code, { event: 'end', winner: winner.name, game: this.filterGame(game) });
          this.games = this.games.filter((game2) => game2.code != game.code);
          return;
        }

        this.newRound(game);
        this.server.emit(game.code, { event: 'round', winner, game: this.filterGame(game) });

        game.users.forEach((user) => {
          this.server.to(user.id).emit(game.code, {
            event: 'cards',
            cards: this.findUserById(game, user.id).cardList,
          });
        });

      } else
        this.server.to(payload.id).emit('error', 'invalid card');
    } else
      this.server.to(payload.id).emit('error', 'you can\'t vote');
  }

  @SubscribeMessage('checkGame')
  checkGame(@MessageBody() payload: {
    id: string,
    code: string,
  }): void {
    const game = this.games.find(game => game.code === payload.code);
    if (!game) {
      this.server.to(payload.id).emit('error', 'not found');
    } else {
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
    if (tries > 1000) {
      this.server.to(paylod.id).emit('error', 'too many tries');
    } else {
      this.games.push({
        code,
        users: [],
        ownerId: undefined,
        started: false,
        askerId: undefined,
        questionCards: [],
        answerCards: [],
        question: undefined,
      });
      this.server.to(paylod.id).emit('create', code);
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
      if (game.users.length < 2) {
        this.server.to(payload.id).emit('error', 'not enough player');
        return;
      }

      if (game.ownerId === payload.id) {
        game.started = true;
        const findQuestions = this.questionCardRepository.find();
        const findAnswers = this.answercardRepository.find();

        /*
        this.questionCardRepository.find().then((questionCards) => {
          game.questionCards = [...questionCards];
        });
        console.log('answer1');
        this.answercardRepository.find().then((answerCards) => {
          console.log('answer2');
          // game.answerCards = [...answerCards];
          game.answerCards = answerCards.map((card) => (
            {id: card.id, text: card.text}
          ))
          console.log(game.answerCards);
        });
        console.log('answer3');
        console.log(game.answerCards);
        */

        Promise.all([findQuestions, findAnswers]).then(([questionCards, answerCards]) => {
          game.questionCards = [...questionCards];
          game.answerCards = [...answerCards];

          for (const user of game.users) {
            for (let i = 0; i < 7; i++) {
              const pickedCard = game.answerCards[Math.floor(Math.random() * game.answerCards.length)];
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
          this.server.emit(payload.code, {
            event: 'waiting',
            waiting: this.listWaitingUsers(game),
          });
          game.users.forEach((user) => {
            this.server.to(user.id).emit(game.code, {
              event: 'cards',
              cards: this.findUserById(game, user.id).cardList,
            });
          });
        }).catch((error) => this.server.to(payload.id).emit('error', error));

      } else
        this.server.to(payload.id).emit('error', 'not owner');
    } else {
      this.server.to(payload.id).emit('error', 'not found');
    }
  }
}
