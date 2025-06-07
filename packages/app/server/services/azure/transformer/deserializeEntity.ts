import type { AzureEntity } from "#shared/models/azure/AzureEntity";
import type { TableEntityResult } from "@azure/data-tables";
import type { Class } from "type-fest";

import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { getIsSerializable } from "@@/server/services/azure/transformer/getIsSerializable";

export const deserializeEntity = <TEntity extends AzureEntity>(
  entity: TableEntityResult<TEntity>,
  cls: Class<TEntity>,
): TEntity => {
  const instance = new cls();
  const objectKeys = instance.getObjectKeys();
  // Unfortunately, we'll have to ensure that custom object keys that have optional values have to be declared in the class
  // if the default property value of the class does not reflect whether it is serializable
  for (const [property, value] of Object.entries(entity) as [keyof TEntity, unknown][])
    if (objectKeys.includes(property) || getIsSerializable(instance[property]))
      instance[property] = jsonDateParse(value as string);
    else instance[property] = value as TEntity[keyof TEntity];
  return instance;
};
