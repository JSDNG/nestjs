import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaService } from '@/prisma.service';

@Module({
  imports: [
    MulterModule.register({
      //dest: './uploads',
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, PrismaService],
})
export class FilesModule {}
