import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameGateway } from './game.gateway';

@Controller('game')
export class GameController {
  constructor(public gameGateway: GameGateway) {
  }
}
