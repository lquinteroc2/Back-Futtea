import { Injectable, NotFoundException } from '@nestjs/common';
import { FilesUploadRepository } from './file-upload.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedImage } from './entities/file-upload.entity';



@Injectable()
export class FileUploadService {
  constructor(
    private readonly filesRepository: FilesUploadRepository,
    @InjectRepository(UploadedImage)
    private readonly imageRepo: Repository<UploadedImage>,
  ) {}

  async uploadUserProfileImage(files: Express.Multer.File[], userId: string) {
    const uploadedUrls = [];
  
    for (const file of files) {
      const uploaded = await this.filesRepository.uploadImage(file);
      await this.imageRepo.save({ url: uploaded.secure_url, userId });
      uploadedUrls.push(uploaded.secure_url);
    }
  
    return uploadedUrls;
  }

  async deleteImage(imageUUID: string) {
    const image = await this.imageRepo.findOne({ where: { uuid: imageUUID } });
    if (!image) throw new NotFoundException('Image not found');
    await this.filesRepository.deleteImageFromCloudinary(image.url);
    await this.imageRepo.remove(image);
    return { message: 'Image deleted successfully' };
  }

  async updateImage(imageUUID: string, file: Express.Multer.File) {
    const image = await this.imageRepo.findOne({ where: { uuid: imageUUID } });
    if (!image) throw new NotFoundException('Image not found');
    await this.filesRepository.deleteImageFromCloudinary(image.url);
    const uploaded = await this.filesRepository.uploadImage(file);
    image.url = uploaded.secure_url;
    return this.imageRepo.save(image);
  }
}

