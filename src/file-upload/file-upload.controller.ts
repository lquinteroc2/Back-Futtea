import {
  Controller,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Put,
  UploadedFile,
  UploadedFiles,
  // UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// import { AuthGuard } from '../guards/auth.guard';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// @ApiTags('FILES')
@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  // @ApiBearerAuth()
  @Put('uploadImages/:userId')
    @UseInterceptors(FilesInterceptor('files', 5)) // Máximo 5 imágenes
    uploadImages(
      @Param('userId') userId: string,
      @UploadedFiles(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 500000 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
          ],
        }),
      )
      files: Express.Multer.File[],
    ) {
      return this.fileUploadService.uploadUserProfileImage(files, userId);
    }

 @Delete('deleteImage/:imageId')
   async deleteImage(@Param('imageId') imageUUID: string) {
   return this.fileUploadService.deleteImage(imageUUID);
  }

  @Patch('updateImage/:imageId')
  @UseInterceptors(FileInterceptor('file'))
  async updateImage(
    @Param('imageId') imageUUID: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileUploadService.updateImage(imageUUID, file);
  }
  
  @Put('uploadLocationImages/:locationId')
  @UseInterceptors(FilesInterceptor('files', 5))
  uploadLocationImages(
    @Param('locationId') locationId: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.fileUploadService.uploadLocationImages(files, locationId);
  }

  @Put('uploadFieldImages/:fieldId')
  @UseInterceptors(FilesInterceptor('files', 5))
  uploadFieldImages(
    @Param('fieldId') fieldId: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.fileUploadService.uploadFieldImages(files, fieldId);
  }


}
