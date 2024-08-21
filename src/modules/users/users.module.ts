import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { MongooseModule } from '@nestjs/mongoose';
//import { User, UserSchema } from './schemas/user.schema';
import { PrismaService } from '@/prisma.service';

@Module({
//   imports: [
//     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
//   ],
  providers: [UsersResolver, UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
