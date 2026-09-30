
import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller() 
export class AppController {
  @Get()
  getHello(): string {
    return '¡Hola, esta es la API!';
  }

  @Post('echo')
  echo(@Body() body: any): any {
    return {
      mensaje: 'Recibido con éxito',
      datos: body,
    };
  }
}
