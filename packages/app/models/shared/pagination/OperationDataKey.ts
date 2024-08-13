import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";
import type { Operation } from "@esposter/shared";

export type OperationDataKey<TEntityTypeKey extends EntityTypeKey> =
  | `${Uncapitalize<Exclude<Operation, Operation.Push>>}${TEntityTypeKey}`
  | `${Uncapitalize<Operation.Push>}${TEntityTypeKey}List`
  | `${Uncapitalize<TEntityTypeKey>}List`;
