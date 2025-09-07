import type { CompositeKey } from "#shared/models/azure/CompositeKey";
import type { Class } from "type-fest";

import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { getIsSerializable } from "@@/server/services/azure/transformer/getIsSerializable";

export const deserializeEntity = <TEntity extends CompositeKey>(entity: TEntity, cls: Class<TEntity>): TEntity => {
  const instance = new cls();
  // We don't want to deserialize Date properties with null values in the constructor i.e. deletedAt
  for (const [property, value] of Object.entries(entity) as [keyof TEntity, unknown][])
    if (getIsSerializable(instance[property]) && !(value instanceof Date))
      instance[property] = jsonDateParse(value as string);
    else instance[property] = value as TEntity[keyof TEntity];
  return instance;
};
