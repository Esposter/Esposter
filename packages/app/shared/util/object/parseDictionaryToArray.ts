export const parseDictionaryToArray = <TId extends string, T extends object, TIdKey extends string = "id">(
  dictionary: Record<TId, T>,
  idKey: TIdKey = "id" as TIdKey,
) => Object.entries<T>(dictionary).map(([id, rest]) => ({ ...rest, [idKey]: id }) as Record<TIdKey, TId> & T);
