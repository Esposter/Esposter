import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { deserializeEntity } from "@/services/azure/transformer/deserializeEntity";

export const getEntity = async <TTableEntity extends AzureEntity, TEntity extends TTableEntity>(
  tableClient: CustomTableClient<TTableEntity>,
  cls: Class<TEntity>,
  ...args: Parameters<CustomTableClient<TTableEntity>["getEntity"]>
): Promise<null | TEntity> => {
  try {
    const { etag: _etag, ...entity } = await tableClient.getEntity(...args);
    return deserializeEntity(entity, cls);
  } catch {
    return null;
  }
};
