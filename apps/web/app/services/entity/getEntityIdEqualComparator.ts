export const getEntityIdEqualComparator =
  <TEntity extends object>(idKeys: (keyof TEntity & string)[], entityToCompare: Partial<TEntity>) =>
  (entity: TEntity) =>
    idKeys.every((key) => entity[key] === entityToCompare[key]);
