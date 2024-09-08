import { Resolver, Mutation, Args } from '@nestjs/graphql';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { createWriteStream, ReadStream } from 'fs';
import { join } from 'path';

@Resolver()
export class FilesUploadResolver {
  // @Mutation(()=> Boolean)
  // async fileUpload(@Args({name: "file", type: ()=> GraphQLUpload}) file: Upload): Promise<boolean>{
  //   return this.filesUploadService.fileUpload(file);
  // }

  @Mutation(() => Boolean)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload }) file: {
      createReadStream: () => ReadStream;
      filename: string;
    },
  ): Promise<boolean> {
    const { createReadStream, filename } = file;

    console.log('Received file:', filename);

    try {
      return new Promise((resolve, reject) =>
        createReadStream()
          .pipe(createWriteStream(join(process.cwd(), 'uploads', filename)))
          .on('finish', () => resolve(true))
          .on('error', (err) => {
            console.error('Upload error:', err);
            reject(false);
          }),
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      throw new Error('Internal server error');
    }
  }
}
