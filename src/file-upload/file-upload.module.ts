import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { CloudinaryConfig } from '../config/cloudinary';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesUploadRepository } from './file-upload.repository';
import { UploadedImage } from './entities/file-upload.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UploadedImage])],
  controllers: [FileUploadController],
  providers: [FileUploadService, CloudinaryConfig, FilesUploadRepository],
  exports: [FileUploadService, FilesUploadRepository],
})
export class FileUploadModule {}
