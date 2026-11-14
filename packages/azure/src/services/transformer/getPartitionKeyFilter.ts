import type { CompositeKey } from "@esposter/db-schema";

import { serializeSearchClauses } from "#src/services/transformer/serializeSearchClauses";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";

// The search filter of everything under one partition key, for the search index delete that clears a room
export const getPartitionKeyFilter = (partitionKey: CompositeKey["partitionKey"]): string =>
  serializeSearchClauses([
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: partitionKey },
  ]);
