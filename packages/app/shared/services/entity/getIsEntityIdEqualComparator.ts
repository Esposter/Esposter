import type { AEntity } from "#shared/models/entity/AEntity";
import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";
import type { ToData } from "#shared/models/entity/ToData";

export const getIsEntityIdEqualComparator =
  <TEntity extends ToData<AEntity>, TIdKeys extends EntityIdKeys<TEntity>>(
    idKeys: [...TIdKeys],
    entityToCompare: Partial<{ [P in keyof TEntity & TIdKeys[number]]: TEntity[P] }>,
  ) =>
  (i: TEntity) =>
    idKeys.every((key) => i[key as keyof TEntity] === entityToCompare[key as keyof TEntity & TIdKeys[number]]);
