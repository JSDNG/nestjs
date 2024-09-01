import { Field } from '@nestjs/graphql';
import { IEdgeType } from './edge-type';

export class IPaginatedType<T> {
  @Field()
  edges: IEdgeType<T>[];
  @Field()
  nodes: T[];
  @Field()
  totalCount: number;
  @Field()
  hasNextPage: boolean;
}
