import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

interface AuthenticatedRequest extends Request {
  user: {
    uuid: string;
  };
}


// @ApiTags('USERS')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  // @ApiBearerAuth()
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    return this.usersService.getUsers(page || 1, limit || 5);
  }

  // @ApiBearerAuth()
  @Get('me')
  @UseGuards(AuthGuard)
  getMyProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.getUser(req.user.uuid);
  }
  
  // @ApiBearerAuth()
  @Get(':uuid')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAnyUser(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.usersService.getUser(uuid);
  }
  
  // @ApiBearerAuth()
  @Post()
  addUser(@Body() user: CreateUserDto) {
    return this.usersService.addUser(user);
  }


  // Modificar perfil del usuario autenticado
  // @ApiBearerAuth()
  @Put(':uuid')
  @UseGuards(AuthGuard)
  updateProfile(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() user: UpdateUserDto,
    @Req() req,
  ) {
    if (req.user.uuid !== uuid) {
      throw new UnauthorizedException('No puedes modificar otro perfil');
    }
    return this.usersService.updateUser(uuid, user);
  }
  
  // @ApiBearerAuth()
  @Patch('me')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() updateProfileDto: UpdateUserDto,
  ) {
    const userUUID = req.user.uuid;
  
    if (file) {
      const imageUrl = await this.fileUploadService.uploadUserProfileImage([file], req.user.uuid); // Pass userId and array of files
      updateProfileDto.profileImage = imageUrl[0]; // Assuming the response is an array
    }
  
    return this.usersService.updateUser(userUUID, updateProfileDto);
  }
  
  // Modificar el rol de un usuario (Solo admin)
  // @ApiBearerAuth()
  @Put(':uuid/role')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  updateUserRole(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body('role') role: Role,
  ) {
    return this.usersService.updateUserRole(uuid, role);
  }

  // Banear o desbanear usuario (Solo admin)
  // @ApiBearerAuth()
  @Put(':uuid/ban')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  toggleBanUser(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body('ban') ban: boolean,
  ) {
    return this.usersService.toggleBanUser(uuid, ban);
  }


  // Eliminar su propia cuenta (Usuario autenticado)
  // @ApiBearerAuth()
  @Delete(':uuid')
  @UseGuards(AuthGuard)
  deleteOwnAccount(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Req() req,
  ) {
    if (req.user.uuid !== uuid) {
      throw new UnauthorizedException('No puedes eliminar otra cuenta');
    }
    return this.usersService.deleteUser(uuid);
  }

    // Eliminar otro usuario (Solo admin)
    // @ApiBearerAuth()
    @Delete(':uuid/admin')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN)
    deleteUser(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
      return this.usersService.deleteUser(uuid);
    }

    @Post('verify-email')
    verifyEmail(@Body() body: { email: string; code: string }) {
      return this.usersService.verifyEmail(body.email, body.code);
    }

    @Post('resend-verification-code')
    resendVerificationCode(@Body() body: { email: string }) {
      return this.usersService.resendVerificationCode(body.email);
    }

    @Post('request-password-reset')
    requestPasswordReset(@Body() body: { email: string }) {
      return this.usersService.requestPasswordReset(body.email);
    }

    @Post('reset-password')
    resetPassword(@Body() body: { token: string; password: string }) {
      return this.usersService.resetPassword(body.token, body.password);
    }
}
