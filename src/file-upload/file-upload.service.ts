import { Injectable, NotFoundException } from '@nestjs/common';
import { FilesUploadRepository } from './file-upload.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedImage } from './entities/file-upload.entity';
import { Field } from 'src/locations/entities/field.entity';
import { Location } from 'src/locations/entities/location.entity';



@Injectable()
export class FileUploadService {
  constructor(
    private readonly filesRepository: FilesUploadRepository,
    @InjectRepository(UploadedImage)
    private readonly imageRepo: Repository<UploadedImage>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    @InjectRepository(Field)
    private readonly fieldRepo: Repository<Field>,
  ) {}

  async uploadUserProfileImage(files: Express.Multer.File[], userId: string) {
    const uploadedUrls: string[] = [];
  
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

  async uploadLocationImages(files: Express.Multer.File[], locationId: string) {
    const location = await this.locationRepo.findOne({ 
      where: { id: locationId },
      relations: ['images', 'fields'],
    });
    if (!location) throw new NotFoundException('Location not found');
  
    const urls: string[] = [];
  
    for (const file of files) {
      const uploaded = await this.filesRepository.uploadImage(file);
      await this.imageRepo.save({ url: uploaded.secure_url, location });
      urls.push(uploaded.secure_url);
    }
  
    return urls;
  }
  
  async uploadFieldImages(files: Express.Multer.File[], fieldId: string) {
    const field = await this.fieldRepo.findOne({ 
      where: { id: fieldId },
      relations: ['images'],
    });
    if (!field) throw new NotFoundException('Field not found');
  
    const urls: string[] = [];
  
    for (const file of files) {
      const uploaded = await this.filesRepository.uploadImage(file);
      await this.imageRepo.save({ url: uploaded.secure_url, field });
      urls.push(uploaded.secure_url);
    }
  
    return urls;
  }
  
}

