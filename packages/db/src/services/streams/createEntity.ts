import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { AzureEntity } from "@esposter/db-schema";
import type { CompositeKey } from "@esposter/db-schema";

import { serializeEntity } from "#src/services/streams/serializeEntity";

export const createEntity = <TEntity extends CompositeKey>(
  tableClient: StreamTableClient<TEntity>,
  entity: AzureEntity | CompositeKey,
): Promise<{ etag: string }> => tableClient.createEntity(serializeEntity(entity));
