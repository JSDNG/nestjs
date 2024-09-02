import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class Filter {
  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}