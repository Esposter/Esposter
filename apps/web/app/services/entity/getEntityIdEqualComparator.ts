export const getEntityIdEqualComparator =
  <TEntity extends object>(
    idKeys: (keyof TEntity & string)[],
    entityToCompare: { [P in keyof TEntity]?: TEntity[P] | undefined },
  ) =>
  (entity: TEntity) =>
    idKeys.every((key) => entity[key] === entityToCompare[key]);
