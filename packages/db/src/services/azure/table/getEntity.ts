import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { deserializeEntity } from "@/services/azure/transformer/deserializeEntity";

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
