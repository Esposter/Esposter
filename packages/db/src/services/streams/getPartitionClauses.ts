import type { Clause, CompositeKey } from "@esposter/db-schema";

import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";

// Every table partitions on its owning entity's id, so "everything under this key" is the clause a read, a count and a
// purge all start from
export const getPartitionClauses = <TEntity extends CompositeKey>(
  partitionKey: TEntity["partitionKey"],
): Clause<TEntity>[] => [
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: partitionKey },
];
