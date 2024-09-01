import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export interface IEdgeType<T> {
  cursor: string;
  node: T;
}

@ObjectType({ isAbstract: true })
export abstract class EdgeType<T> implements IEdgeType<T> {
  @Field((type) => String)
  cursor: string;

  @Field((type) => Object)
  node: T;
}
