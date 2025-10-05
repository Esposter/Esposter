import type { TableClient } from "@azure/data-tables";
import type { CompositeKey } from "@esposter/shared";
// We add a fake property to preserve the entity type for the table client
// because the entity type should always be tied to the table 1-1
export type CustomTableClient<TEntity extends CompositeKey> = TableClient & { entityType: TEntity };
