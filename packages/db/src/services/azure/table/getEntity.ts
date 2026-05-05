import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { deserializeEntity } from "@/services/azure/transformer/deserializeEntity";
import { getResultAsync } from "@esposter/shared";

export const getEntity = <TTableEntity extends AzureEntity, TEntity extends TTableEntity>(
  tableClient: CustomTableClient<TTableEntity>,
  cls: Class<TEntity>,
  ...args: Parameters<CustomTableClient<TTableEntity>["getEntity"]>
): Promise<null | TEntity> =>
  getResultAsync(async () => {
    const { etag: _etag, ...entity } = await tableClient.getEntity(...args);
    return deserializeEntity(entity, cls);
  }).unwrapOr(null);
