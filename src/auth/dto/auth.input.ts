import { InputType, Int, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';

@InputType()
export class RegisterAuthInput {
  @Field(() => String, { nullable: true })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  username: string;

  @Field(() => String, { nullable: true })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ!' })
  email: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6)
  password: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(
    /^(\+?\d{1,4}[\s-])?(?:\(?\d{1,5}\)?[\s-]?)\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}$/,
    {
      message: 'Số điện thoại không hợp lệ!',
    },
  )
  phone?: string;
}

@InputType()
export class LoginAuthInput {
  @Field(() => String, { nullable: true })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ!' })
  email: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6)
  password: string;
}
