import type { AzureEntity } from "#shared/models/azure/AzureEntity";
import type { Class } from "type-fest";

import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { getIsSerializable } from "@@/server/services/azure/transformer/getIsSerializable";

export const deserializeEntity = <TEntity extends AzureEntity>(entity: TEntity, cls: Class<TEntity>): TEntity => {
  const instance = new cls();
  // We'll ensure that the default property value of the class will reflect whether it is serializable
  for (const [property, value] of Object.entries(entity) as [keyof TEntity, unknown][])
    if (getIsSerializable(instance[property])) instance[property] = jsonDateParse(value as string);
    else instance[property] = value as TEntity[keyof TEntity];
  return instance;
};
