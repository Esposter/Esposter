import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { Clause, CompositeKey } from "@esposter/db-schema";

// The rows the clauses select, counted by the database. A bound makes the result a floor rather than an exact total
export const readEntitiesCount = async <TEntity extends CompositeKey>(
  tableClient: StreamTableClient<TEntity>,
  clauses: Clause<Record<string, unknown>>[] = [],
  maxCount = Number.POSITIVE_INFINITY,
): Promise<number> => Math.min(await tableClient.count(clauses), maxCount);
