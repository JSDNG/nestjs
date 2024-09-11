import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '@/prisma.service';
import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

@Injectable()
export class FilesService {
  //private readonly s3: S3;
  private readonly s3Client: S3Client;
  private readonly bucketName = process.env.S3_BUCKET_NAME; // Tên bucket của bạn

  // constructor() {
  //   this.s3 = new S3({
  //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //     region: process.env.AWS_REGION, // Khu vực bạn tạo bucket
  //   });
  // }

  constructor(private prismaService: PrismaService) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

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

      await this.prismaService.user.update({
        where: { id: +id },
        data: { imgName: fileName },
      });

      const command = new PutObjectCommand(params);
      const result = await this.s3Client.send(command);
      return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

      //const uploadResult = await this.s3.upload(params).promise();
      //return uploadResult.Location; // URL của file đã upload
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Error uploading file to S3');
    }
  }

  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
  }

  findAll() {
    return `This action returns all files`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
