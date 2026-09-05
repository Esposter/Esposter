import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { checkIsNotFound } from "#src/services/azure/checkIsNotFound";
import { deserializeEntity } from "#src/services/azure/transformer/deserializeEntity";
import { getResultAsync } from "@esposter/shared";

// `getEntity` strips the etag for callers that don't need it; optimistic-concurrency callers read through
// Here instead so their subsequent update can be made conditional on the version they saw.
// Only the service's own 404 becomes the not-found sentinel — a read that merely failed (throttling, a socket
// Reset, an entity that will not deserialize) propagates, because a caller cannot tell the two apart once they
// Collapse into one value and reports a transient fault as a deletion the user is looking straight at
export const getEntityWithEtag = <TTableEntity extends AzureEntity, TEntity extends TTableEntity>(
  tableClient: CustomTableClient<TTableEntity>,
  cls: Class<TEntity>,
  ...args: Parameters<CustomTableClient<TTableEntity>["getEntity"]>
): Promise<undefined | { entity: TEntity; etag: string }> =>
  getResultAsync(async () => {
    const { etag, ...entity } = await tableClient.getEntity(...args);
    return { entity: deserializeEntity(entity, cls), etag };
  }).match<undefined | { entity: TEntity; etag: string }>(
    (entityWithEtag) => entityWithEtag,
    (error) => {
      if (checkIsNotFound(error)) return undefined;
      throw error;
    },
  );
