import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";

export const getIsEntityIdEqualComparator =
  <TEntity extends Record<string, unknown>, TIdKeys extends EntityIdKeys<TEntity>>(
    idKeys: [...TIdKeys],
    entityToCompare: Partial<{ [P in keyof TEntity & TIdKeys[number]]: TEntity[P] }>,
  ) =>
  (i: TEntity) =>
    idKeys.every((key) => i[key as keyof TEntity] === entityToCompare[key as keyof TEntity & TIdKeys[number]]);
