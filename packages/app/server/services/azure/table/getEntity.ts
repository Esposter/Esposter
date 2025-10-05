import type { AzureEntity } from "#shared/models/azure/table/AzureEntity";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { Class } from "type-fest";

import { deserializeEntity } from "@@/server/services/azure/transformer/deserializeEntity";

export const getEntity = async <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  cls: Class<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["getEntity"]>
): Promise<null | TEntity> => {
  try {
    const entity = await tableClient.getEntity<TEntity>(...args);
    return deserializeEntity(entity, cls);
  } catch {
    return null;
  }
};
