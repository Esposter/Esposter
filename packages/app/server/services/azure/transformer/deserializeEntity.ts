import type { AzureEntity } from "#shared/models/azure/AzureEntity";
import type { TableEntityResult } from "@azure/data-tables";
import type { Class } from "type-fest";

import { jsonDateParse } from "#shared/util/time/jsonDateParse";
// We'll enforce that all entities that have array properties will have [] as the default value
// so we can safely parse them as arrays by checking if the property is an array at runtime
export const deserializeEntity = <TEntity extends AzureEntity>(
  entity: TableEntityResult<TEntity>,
  cls: Class<TEntity>,
): TEntity => {
  const instance = new cls();
  for (const [property, value] of Object.entries(entity))
    if (Array.isArray(instance[property as keyof TEntity]))
      instance[property as keyof TEntity] = jsonDateParse(value as string);
    else instance[property as keyof TEntity] = value as TEntity[keyof TEntity];
  return instance;
};
