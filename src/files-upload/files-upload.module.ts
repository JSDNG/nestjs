import { Module } from '@nestjs/common';
import { FilesUploadService } from './files-upload.service';
import { FilesUploadResolver } from './files-upload.resolver';

@Module({
  providers: [FilesUploadResolver, FilesUploadService, ],
})
export class FilesUploadModule {}
