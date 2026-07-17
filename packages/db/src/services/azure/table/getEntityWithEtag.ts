import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { deserializeEntity } from "@/services/azure/transformer/deserializeEntity";
import { getResultAsync } from "@esposter/shared";

// GetEntity strips the etag for callers that don't need it; optimistic-concurrency callers read through
// Here instead so their subsequent update can be made conditional on the version they saw
export const getEntityWithEtag = <TTableEntity extends AzureEntity, TEntity extends TTableEntity>(
  tableClient: CustomTableClient<TTableEntity>,
  cls: Class<TEntity>,
  ...args: Parameters<CustomTableClient<TTableEntity>["getEntity"]>
): Promise<{ entity: TEntity; etag: string } | undefined> =>
  getResultAsync(async () => {
    const { etag, ...entity } = await tableClient.getEntity(...args);
    return { entity: deserializeEntity(entity, cls), etag };
  }).unwrapOr(undefined);
