import type { CompositeKey } from "@esposter/db-schema";

import { serializeClauses } from "@/services/azure/transformer/serializeClauses";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";

// Every table partitions on its owning entity's id, so "everything under this key" is the filter a read,
// A count and a purge all start from. Written once here so those three can never disagree about it —
// A feature that also filters on its own columns builds its clause array instead
export const getPartitionKeyFilter = (partitionKey: CompositeKey["partitionKey"]): string =>
  serializeClauses([{ key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: partitionKey }]);
