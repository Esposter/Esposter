import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { CompositeKey } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { deserializeEntity } from "#src/services/streams/deserializeEntity";

// `getEntity` drops the etag for callers that do not need optimistic concurrency. A missing row is undefined, and a read
// that failed propagates, so a caller branching on it never acts on a fault as if the row were deleted
export const getEntityWithEtag = async <TEntity extends CompositeKey>(
  tableClient: StreamTableClient<TEntity>,
  cls: Class<TEntity>,
  partitionKey: string,
  rowKey: string,
): Promise<undefined | { entity: TEntity; etag: string }> => {
  const row = await tableClient.getEntity(partitionKey, rowKey);
  if (!row) return undefined;
  const { etag, ...properties } = row;
  return { entity: deserializeEntity(properties, cls), etag };
};
