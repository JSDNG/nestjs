import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  readonly name: string;

  @Field()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email không hợp lệ!' })
  readonly email: string;
}
