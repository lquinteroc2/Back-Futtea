import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class FilesUploadRepository {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) {
            reject(new Error(String(error?.message ?? 'Unknown error')))
          } else {
            resolve(result);
          }
        },
      );

      const bufferToStream = (buffer: Buffer): Readable => {
        const readable = new Readable();
        readable._read = () => {}; // _read is required but you can noop it
        readable.push(buffer);
        readable.push(null);
        return readable;
      };

      bufferToStream(file.buffer).pipe(upload);
    });
  }

  async deleteImageFromCloudinary(imageUrl: string): Promise<void> {
    // Extraer el `public_id` de la URL de la imagen de Cloudinary
    const publicId = imageUrl.split('/').pop()?.split('.')[0];
  
    if (!publicId) {
      throw new Error('Invalid Cloudinary URL');
    }
  
    try {
      await v2.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(String(error?.message ?? 'Error deleting image from Cloudinary'));
    }
  }
}
