import type { ItemMetadata } from "@esposter/shared";
import type { Clause, CompositeKey } from "@esposter/db-schema";

import { BinaryOperator } from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";
import { getPartitionClauses } from "#src/services/streams/getPartitionClauses";

// The rows of one partition that a soft delete has not hidden, the predicate every read of a room's messages, notes and
// log lines starts from, so no read can forget the `deletedAt` half and resurface what a delete hid
export const getLivePartitionClauses = <TEntity extends CompositeKey & ItemMetadata>(
  partitionKey: TEntity["partitionKey"],
): Clause<TEntity>[] => [
  ...getPartitionClauses<TEntity>(partitionKey),
  { key: ItemMetadataPropertyNames.deletedAt, operator: BinaryOperator.Eq, value: null },
];
