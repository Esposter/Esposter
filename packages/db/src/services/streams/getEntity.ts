import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { CompositeKey } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { getEntityWithEtag } from "#src/services/streams/getEntityWithEtag";

// The entity, without its etag, for a caller that does not write it back conditionally
export const getEntity = async <TEntity extends CompositeKey>(
  tableClient: StreamTableClient<TEntity>,
  cls: Class<TEntity>,
  partitionKey: string,
  rowKey: string,
): Promise<TEntity | undefined> => (await getEntityWithEtag(tableClient, cls, partitionKey, rowKey))?.entity;
