import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UploadUrlResponse {
  @Field(() => String)
  uploadUrl: string;
}