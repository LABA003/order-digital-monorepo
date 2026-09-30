import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlatillosService } from './platillos.service';
import { CreatePlatilloDto } from './dto/create-platillo.dto';
import { UpdatePlatilloDto } from './dto/update-platillo.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('platillos')
@Controller('platillos')

export class PlatillosController {
  constructor(private readonly platillosService: PlatillosService) {}
  /**
   * Crea un nuevo platillo.
   * @param data Datos del platillo a crear.
   * @returns Información del platillo creado.
   */

  @ApiOperation({ summary: 'Create a new platillo' })
  @ApiCreatedResponse({ type: CreatePlatilloDto })
  @Post('create')
  create(@Body() data: CreatePlatilloDto) {
    return this.platillosService.create(data);
  }

  @ApiOperation({ summary: 'Get all platillos' })
  @Get()
  findAll() {
    return this.platillosService.findAll();
  }

  @ApiOperation({ summary: 'Get a platillo by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.platillosService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a platillo by id' })
  @ApiCreatedResponse({ type: UpdatePlatilloDto })
  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdatePlatilloDto) {
    return this.platillosService.update(+id, data);
  }

  @ApiOperation({ summary: 'Delete a platillo by id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.platillosService.remove(+id);
  }
}
