import type { BinaryOperator, Clause, SerializableValue } from "@esposter/db-schema";

import type { SearchOperator } from "#src/models/search/SearchOperator";

// A clause an Azure Search filter is built from: the row clause of db-schema, plus the collection operators a search
// index can test and a table read cannot
export type SearchClause<T extends object> = { key: keyof T & string; not?: boolean } & (
  | { operator: BinaryOperator; value: SerializableValue }
  | { operator: SearchOperator.ArrayAny }
  | { operator: SearchOperator.ArrayContains; value: SerializableValue[] }
);

export type { Clause };
