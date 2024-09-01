import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class CreateRoleInput {
  @Field(() => String, { nullable: true })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  roleName: string;
}
