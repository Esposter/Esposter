import type { CompositeKey } from "@esposter/shared";
import type { Class } from "type-fest";

import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { getIsSerializable } from "@@/server/services/azure/transformer/getIsSerializable";

export const deserializeEntity = <TEntity extends CompositeKey>(entity: TEntity, cls: Class<TEntity>): TEntity => {
  const instance = new cls();
  // Azure Table Storage already deserializes Date properties for us C:
  for (const [property, value] of Object.entries(entity) as [keyof TEntity, unknown][])
    if (!(value instanceof Date) && getIsSerializable(instance[property]))
      instance[property] = jsonDateParse(value as string);
    else instance[property] = value as TEntity[keyof TEntity];
  return instance;
};
