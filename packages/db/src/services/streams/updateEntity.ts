import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { UpdateMode } from "#src/models/streams/UpdateMode";
import type { AzureEntity, AzureUpdateEntity } from "@esposter/db-schema";

import { serializeEntity } from "#src/services/streams/serializeEntity";

export const updateEntity = <TEntity extends AzureEntity>(
  tableClient: StreamTableClient<TEntity>,
  entity: AzureUpdateEntity<TEntity>,
  mode: UpdateMode,
  options?: { etag?: string },
): Promise<{ etag: string }> => {
  entity.updatedAt = new Date();
  return tableClient.updateEntity(serializeEntity(entity), mode, options);
};
