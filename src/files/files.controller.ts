import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Args, Int, Mutation } from '@nestjs/graphql';
import { UploadUrlResponse } from './entities/file.entity';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Args('id', { type: () => Number }) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new NotFoundException();
    }
    const url = await this.filesService.uploadFile(id, file);

    return {
      message: 'File uploaded successfully!',
      url,
    };
  }

  @Get('list')
  async listFiles() {
    return this.filesService.listFiles();
  }

  @Delete(':fileName')
  async deleteFile(@Param('fileName') fileName: string) {
    await this.filesService.deleteFile(fileName);
    return { message: 'File deleted successfully' };
  }

  @Post('generate-upload-url')
  async getUploadUrl(
    @Body('contentType') contentType: string,
    @Body('id') id: number,
  ) {
    const uploadUrl = await this.filesService.generateUploadUrl(
      id,
      contentType,
    );
    return { uploadUrl };
  }
  
  @Post('copy')
  async copyFile(
    @Body('source') source: string,
    @Body('destinationKey') destinationKey: string,
  ) {
    await this.filesService.copyFile(source, destinationKey);
    return { message: 'File copied successfully' };
  }

  @Get('signed-url')
  async getSignedUrl(
    @Query('id') id?: number,
    @Query('key') key?: string,
  ) {
    if (!key) {
      throw new NotFoundException('File name is required');
    }
    const signedUrl = await this.filesService.generateSignedUrl(id, key);
    return { signedUrl };
  }
}
