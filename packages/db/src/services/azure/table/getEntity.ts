import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { getEntityWithEtag } from "#src/services/azure/table/getEntityWithEtag";

// Reads through getEntityWithEtag and drops the etag for callers that don't need optimistic concurrency. Undefined
// Means the entity is absent and nothing else — a read that failed propagates from the etag reader, so a caller
// Branching on it is never acting on a transient fault dressed up as a deletion
export const getEntity = async <TTableEntity extends AzureEntity, TEntity extends TTableEntity>(
  tableClient: CustomTableClient<TTableEntity>,
  cls: Class<TEntity>,
  ...args: Parameters<CustomTableClient<TTableEntity>["getEntity"]>
): Promise<TEntity | undefined> => {
  const entityWithEtag = await getEntityWithEtag(tableClient, cls, ...args);
  return entityWithEtag?.entity;
};
