import type { TableClient } from "@azure/data-tables";
import type { CompositeKey } from "@esposter/azure";
// A phantom property carries the entity type on the client, which is what ties a table to exactly one entity
// Type — `TableClient` alone is generic over every call rather than over the table.
export type CustomTableClient<TEntity extends CompositeKey> = TableClient & { entityType: TEntity };
