import type { CompositeKey } from "@/models/azure";
import type { CustomTableClient } from "@/models/azure/table";
import type { Constructor } from "type-fest";

import { plainToInstance } from "class-transformer";

export const getEntity = async <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  cls: Constructor<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["getEntity"]>
): Promise<TEntity | undefined> => {
  try {
    const entity = await tableClient.getEntity<TEntity>(...args);
    return plainToInstance(cls, entity);
  } catch {
    return undefined;
  }
};
