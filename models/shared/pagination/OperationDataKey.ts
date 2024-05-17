import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";
import type { Operation } from "@esposter/shared/models/shared/Operation";

export type OperationDataKey<TEntityTypeKey extends EntityTypeKey> =
  | `${Uncapitalize<TEntityTypeKey>}List`
  | `${Uncapitalize<Operation.Push>}${TEntityTypeKey}List`
  | `${Uncapitalize<Exclude<Operation, Operation.Push>>}${TEntityTypeKey}`;
