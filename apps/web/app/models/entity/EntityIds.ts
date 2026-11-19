import type { EntityIdKeys } from "#src/models/entity/EntityIdKeys";

export type EntityIds<TEntity extends object, TIdKeys extends EntityIdKeys<TEntity>> = {
  [P in keyof TEntity & TIdKeys[number]]: TEntity[P];
};
