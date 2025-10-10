import type { CompositeKey } from "@/models/azure/table/CompositeKey";
import type { Class } from "type-fest";

import { getIsSerializable } from "@/services/azure/transformer/getIsSerializable";
import { jsonDateParse } from "@esposter/shared";

export const deserializeEntity = <TEntity extends CompositeKey>(entity: TEntity, cls: Class<TEntity>): TEntity => {
  const instance = new cls();
  // Azure Table Storage already deserializes Date properties for us C:
  for (const [property, value] of Object.entries(entity) as [keyof TEntity, unknown][])
    if (!(value instanceof Date) && getIsSerializable(instance[property]))
      instance[property] = jsonDateParse(String(value));
    else instance[property] = value as TEntity[keyof TEntity];
  return instance;
};
