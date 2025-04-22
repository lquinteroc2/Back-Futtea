import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { CloudinaryConfig } from '../config/cloudinary';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesUploadRepository } from './file-upload.repository';
import { UploadedImage } from './entities/file-upload.entity';
import { LocationsModule } from 'src/locations/locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadedImage]),
    LocationsModule
  ],

  controllers: [FileUploadController],
  providers: [FileUploadService, CloudinaryConfig, FilesUploadRepository],
  exports: [FileUploadService, FilesUploadRepository],
})
export class FileUploadModule {}
