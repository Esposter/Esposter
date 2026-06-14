export const parseDictionaryToArray = <TId extends string, T extends object, TIdKey extends string = "id">(
  dictionary: Record<TId, T>,
  idKey: TIdKey = "id" as TIdKey,
) =>
  Object.entries(dictionary).map(
    ([id, rest]) => Object.assign(rest as T, { [idKey]: id as TId }) as Record<TIdKey, TId> & T,
  );
