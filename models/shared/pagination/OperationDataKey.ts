import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";
import type { Operation } from "@/models/shared/pagination/Operation";

export type OperationDataKey<TEntityTypeKey extends EntityTypeKey> =
  | `${Uncapitalize<TEntityTypeKey>}List`
  | `${Operation.push}${TEntityTypeKey}List`
  | `${Exclude<Operation, Operation.push>}${TEntityTypeKey}`;
