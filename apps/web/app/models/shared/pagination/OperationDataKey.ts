import type { EntityTypeKey } from "@esposter/db-schema";
import type { Operation } from "@esposter/shared";

export type OperationDataKey<TEntityTypeKey extends EntityTypeKey> =
  | `${Uncapitalize<Exclude<Operation, typeof Operation.Push | typeof Operation.Unshift>>}${TEntityTypeKey}`
  | `${Uncapitalize<typeof Operation.Push>}${TEntityTypeKey}s`
  | `${Uncapitalize<typeof Operation.Unshift>}${TEntityTypeKey}s`;
