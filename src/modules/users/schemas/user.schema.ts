import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuid } from 'uuid';

//export type UserDocument = HydratedDocument<User>;

//@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Prop()
  @Field()
  username: string;

  @Prop()
  @Field()
  email: string;
  // Thêm các trường khác nếu cần
}

//export const UserSchema = SchemaFactory.createForClass(User);
