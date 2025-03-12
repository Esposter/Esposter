import type { CompositeKey } from "#shared/models/azure/CompositeKey";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { Class } from "type-fest";

import { plainToInstance } from "class-transformer";

export const getEntity = async <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  cls: Class<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["getEntity"]>
): Promise<TEntity | undefined> => {
  try {
    const entity = await tableClient.getEntity<TEntity>(...args);
    return plainToInstance(cls, entity);
  } catch {
    return undefined;
  }
};
