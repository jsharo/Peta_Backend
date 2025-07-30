import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile,
  Query, // <-- Agrega esto
  HttpException, // <-- Agrega esto
  BadRequestException, // <-- Agrega esto
  InternalServerErrorException // <-- Agrega esto
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('pets')
@UseGuards(JwtAuthGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post('admin-create')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads/pets',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${uniqueSuffix}-${file.originalname}`;
        cb(null, filename);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file && file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
      } else if (file) {
        cb(new Error('Solo se permiten archivos de imagen'), false);
      } else {
        cb(null, true); // Permitir sin archivo
      }
    },
  }))
  async createForClient(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() adminUser: User
  ) {
    try {
      console.log('📝 Body recibido:', body);
      console.log('📁 Archivo recibido:', file ? file.filename : 'Sin archivo');

      // Validar datos requeridos
      if (!body.name_pet || !body.id_collar || !body.clientId) {
        throw new BadRequestException('Faltan campos requeridos: name_pet, id_collar, clientId');
      }

      // Construir el DTO desde el FormData
      const createPetDto: CreatePetDto = {
        name_pet: body.name_pet,
        species: body.species || '',
        race: body.race || '',
        sex: body.sex || '',
        id_collar: body.id_collar,
      };

      // Convertir clientId a número
      const clientId = parseInt(body.clientId);
      
      if (isNaN(clientId)) {
        throw new BadRequestException('ID de cliente inválido');
      }

      console.log('🐕 Creando mascota para cliente:', clientId);
      const result = await this.petsService.createForClient(createPetDto, clientId, file);
      console.log('✅ Mascota creada exitosamente:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error en createForClient:', error);
      throw error;
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads/pets',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file && file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
      } else if (file) {
        cb(new Error('Solo se permiten archivos de imagen'), false);
      } else {
        cb(null, true); // Permitir sin archivo
      }
    },
  }))
  async create(
    @Body() body: any,
    @GetUser() user: User,
    @UploadedFile() file?: Express.Multer.File
  ) {
    try {
      console.log('📝 Body recibido en controlador:', body);
      console.log('📁 Archivo recibido:', file ? file.filename : 'Sin archivo');

      // Validar datos requeridos
      if (!body.name_pet || !body.id_collar) {
        throw new BadRequestException('Faltan campos requeridos: name_pet, id_collar');
      }

      // Construir el DTO correctamente con los campos que vienen del frontend
      const createPetDto: CreatePetDto = {
        name_pet: body.name_pet,
        species: body.species || '',
        race: body.race || '',
        sex: body.sex || '',
        id_collar: body.id_collar,
      };

      console.log('🐕 DTO construido:', createPetDto);
      const result = await this.petsService.create(createPetDto, user, file);
      console.log('✅ Mascota creada exitosamente:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error en create:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Manejo específico de errores de base de datos
      if (error.code === '23505' && error.detail?.includes('id_collar')) {
        throw new BadRequestException('Ya existe una mascota con ese código de collar');
      } else if (error.code === '23502') {
        throw new BadRequestException('Faltan campos requeridos en la base de datos');
      }
      
      throw new InternalServerErrorException('Error al procesar la solicitud');
    }
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.petsService.findByUserId(Number(userId));
    }
    return this.petsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.petsService.findOne(+id, user.id_user);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads/pets',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file && file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
      } else if (file) {
        cb(new Error('Solo se permiten archivos de imagen'), false);
      } else {
        cb(null, true);
      }
    },
  }))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @GetUser() user: User,
    @UploadedFile() file?: Express.Multer.File
  ) {
    try {
      console.log('🟢 [UPDATE] Body recibido:', body);
      console.log('🟢 [UPDATE] Archivo recibido:', file ? file.filename : 'Sin archivo');

      const updatePetDto: any = {
        name_pet: body.name_pet,
        species: body.species,
        race: body.race,
        sex: body.sex,
        id_collar: body.id_collar,
        age_pet: body.age_pet !== undefined ? Number(body.age_pet) : undefined,
      };
      if (file) {
        updatePetDto.photo = file.filename;
      }
      const result = await this.petsService.update(+id, updatePetDto, user.id_user);
      return result;
    } catch (error) {
      console.error('❌ Error en update:', error);
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.petsService.remove(+id, user.id_user);
  }

  @Get('user/:userId')
findByUser(@Param('userId') userId: string) {
  return this.petsService.findByUserId(Number(userId));
}
}