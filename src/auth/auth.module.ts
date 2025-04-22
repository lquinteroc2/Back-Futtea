import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { CredentialModule } from 'src/credential/credential.module';

@Module({
  imports: [TypeOrmModule.forFeature([Users]), FileUploadModule, CredentialModule],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
})
export class AuthModule {}
