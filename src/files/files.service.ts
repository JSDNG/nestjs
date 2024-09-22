import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '@/prisma.service';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class FilesService {
  private readonly s3Client: S3Client;
  private readonly bucketName = process.env.S3_BUCKET_NAME;

  constructor(private prismaService: PrismaService) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  // Upload file from backend to s3
  async uploadFile(id: number, file: Express.Multer.File): Promise<string> {
    try {
      const fileName = `${uuid()}-${file.originalname}`; // Tạo tên file unique
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer, // File từ multer (lưu dưới dạng buffer)
        ACL: 'public-read' as ObjectCannedACL, // Quyền truy cập file
        ContentType: file.mimetype,
      };

      this.deleteFile(fileName);

      await this.prismaService.user.update({
        where: { id: +id },
        data: { imgName: fileName },
      });

      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);
      return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Error uploading file to S3');
    }
  }
  // Generate upload url from frontend to s3
  async generateUploadUrl(id: number, contentType: string): Promise<string> {
    try {
      console.log('contentType', contentType);
      const fileName = uuid();
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
        ContentType: contentType,
        ACL: 'public-read' as ObjectCannedACL,
      };

      const user = await this.prismaService.user.findUnique({
        where: { id: id },
      });

      this.deleteFile(user.imgName);

      await this.prismaService.user.update({
        where: { id: +id },
        data: { imgName: fileName },
      });
      const command = new PutObjectCommand(params);
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return uploadUrl;
    } catch (error) {
      console.error(`Error generating upload URL: ${error.message}`);
      throw new Error(`Error generating upload URL: ${error.message}`);
    }
  }
  // List files from S3
  async listFiles() {
    const params = {
      Bucket: this.bucketName,
      MaxKeys: 20,
    };
    try {
      const command = new ListObjectsV2Command(params);
      const result = await this.s3Client.send(command);
      const filesWithType = await Promise.all(
        result.Contents?.map(async (file) => {
          const headCommand = new HeadObjectCommand({
            Bucket: this.bucketName,
            Key: file.Key,
          });
          const { ContentType } = await this.s3Client.send(headCommand);
          return {
            ...file,
            Type: ContentType || 'unknown',
          };
        }) || [],
      );
      return filesWithType;
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Error listing files from S3');
    }
  }
  // Delete a file from S3
  async deleteFile(fileName: string) {
    console.log('fileName', fileName);
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    };
    try {
      // Check if the file exists before deleting
      const headCommand = new HeadObjectCommand(params);
      try {
        await this.s3Client.send(headCommand);
      } catch (error) {
        if (error.name === 'NotFound') {
          throw new Error(`File ${fileName} does not exist in S3`);
        }
        throw error;
      }
      // If the file exists, proceed with deletion
      const deleteCommand = new DeleteObjectCommand(params);
      await this.s3Client.send(deleteCommand);
      console.log(`File ${fileName} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Error deleting file from S3: ${error.message}`);
    }
  }

  // Copy a file in S3
  async copyFile(source: string, destinationKey: string) {
    try {
      // Check if the source folder exists
      const headParams = {
        Bucket: this.bucketName,
        Key: `${source}/`,
      };
      const headCommand = new HeadObjectCommand(headParams);

      try {
        await this.s3Client.send(headCommand);
      } catch (error) {
        if (error.name === 'NotFound') {
          // If the source folder doesn't exist, create it
          const putParams = {
            Bucket: this.bucketName,
            Key: `${source}/`,
            Body: '',
          };
          const putCommand = new PutObjectCommand(putParams);
          await this.s3Client.send(putCommand);
          console.log(`Source folder ${source} created.`);
        } else {
          throw error;
        }
      }

      // Copy the file
      const copyParams = {
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${destinationKey}`,
        Key: `${source}/${destinationKey.split('/').pop()}`,
        ACL: 'public-read' as ObjectCannedACL,
      };
      const copyCommand = new CopyObjectCommand(copyParams);
      await this.s3Client.send(copyCommand);
      console.log(`File ${destinationKey} copied to ${source} folder successfully.`);
    } catch (error) {
      console.error('Error copying file:', error);
      throw new Error(`Error copying file in S3: ${error.message}`);
    }
  }
}
