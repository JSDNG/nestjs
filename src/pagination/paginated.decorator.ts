import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { IPaginatedType } from './paginated-type.interface';
import { EdgeType } from './edge-type';

export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType(`${classRef.name}Edge`)
  class EdgeTypeClass extends EdgeType<T> {
    @Field(() => classRef)
    node: T;
  }

  @ObjectType({ isAbstract: true })
  class PaginatedType implements IPaginatedType<T> {
    @Field(() => [EdgeTypeClass], { nullable: true })
    edges: EdgeTypeClass[];

    @Field(() => [classRef], { nullable: true })
    nodes: T[];

    @Field(() => Int)
    totalCount: number;

    @Field()
    hasNextPage: boolean;
  }
  return PaginatedType as Type<IPaginatedType<T>>;
}
