import type { Clause, CompositeKey } from "@esposter/azure";
import type { ItemMetadata } from "@esposter/shared";

import { ItemMetadataPropertyNames } from "#shared/models/entity/ItemMetadataPropertyNames";
import { BinaryOperator, CompositeKeyPropertyNames, getTableNullClause } from "@esposter/azure";

// The rows of one partition that a soft delete has not hidden — the predicate every read of a room's messages,
// Notes and log lines starts from, so no read can forget the `deletedAt` half and resurface what a delete hid
export const getLivePartitionClauses = <TEntity extends CompositeKey & ItemMetadata>(
  partitionKey: TEntity["partitionKey"],
): Clause<TEntity>[] => [
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: partitionKey },
  getTableNullClause(ItemMetadataPropertyNames.deletedAt),
];
