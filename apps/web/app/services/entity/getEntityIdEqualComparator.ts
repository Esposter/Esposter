export const getEntityIdEqualComparator =
  <TEntity extends object, TIdKey extends keyof TEntity & string = keyof TEntity & string>(
    idKeys: TIdKey[],
    entityToCompare: { [P in TIdKey]?: TEntity[P] | undefined },
  ) =>
  (entity: TEntity) =>
    idKeys.every((key) => entity[key] === entityToCompare[key]);
