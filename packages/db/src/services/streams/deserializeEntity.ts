import type { CompositeKey } from "@esposter/db-schema";

// Builds the class instance an entity is read into, so its defaults and methods come back with its stored properties
export const deserializeEntity = <TEntity extends CompositeKey>(
  entity: Record<string, unknown>,
  cls: new () => TEntity,
): TEntity => Object.assign(new cls(), entity);
