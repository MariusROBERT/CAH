import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/question')
  addQuestion(@Body() data: { text: string, answer: number }) {
    return this.appService.addQuestion(data.text, data.answer);
  }

  @Post('/answer')
  addAnswer(@Body() data: { text: string }) {
    return this.appService.addAnswer(data.text);
  }

  @Post('/bulkQuestion')
  addBulkQuestion(@Body() data: { text: string, answer: number }[]) {
    return this.appService.addBulkQuestion(data);
  }

  @Post('/bulkAnswer')
  addBulkAnswer(@Body() data: { text: string }[]) {
    return this.appService.addBulkAnswer(data);
  }
}
