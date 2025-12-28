import type { EntityTypeKey } from "@esposter/db-schema";
import type { Operation } from "@esposter/shared";

export type OperationDataKey<TEntityTypeKey extends EntityTypeKey> =
  | `${Uncapitalize<Exclude<Operation, Operation.Push | Operation.Unshift>>}${TEntityTypeKey}`
  | `${Uncapitalize<Operation.Push>}${TEntityTypeKey}s`
  | `${Uncapitalize<Operation.Unshift>}${TEntityTypeKey}s`;
