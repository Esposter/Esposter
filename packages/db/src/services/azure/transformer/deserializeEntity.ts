import type { CompositeKey } from "@esposter/azure";

import { checkIsSerializable } from "#src/services/azure/transformer/checkIsSerializable";
import { jsonDateParse } from "@esposter/shared";

export const deserializeEntity = <TEntity extends CompositeKey>(
  entity: Record<string, unknown>,
  cls: new () => TEntity,
): TEntity => {
  const instance = new cls();
  // Azure Table Storage already deserializes Date properties for us C:
  for (const [property, value] of Object.entries(entity) as [keyof TEntity, unknown][])
    if (!(value instanceof Date) && checkIsSerializable(instance[property]))
      instance[property] = jsonDateParse(String(value));
    else instance[property] = value as TEntity[keyof TEntity];
  return instance;
};
