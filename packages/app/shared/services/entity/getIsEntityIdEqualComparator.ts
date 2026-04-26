export const getIsEntityIdEqualComparator =
  <TEntity extends object>(idKeys: (keyof TEntity & string)[], entityToCompare: Partial<TEntity>) =>
  (i: TEntity) =>
    idKeys.every((key) => i[key] === entityToCompare[key]);
