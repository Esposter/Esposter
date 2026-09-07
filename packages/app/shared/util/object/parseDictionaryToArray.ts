export const parseDictionaryToArray = <TId extends string, T extends object, TIdKey extends string = "id">(
  dictionary: Record<TId, T>,
  idKey: TIdKey = "id" as TIdKey,
) =>
  // oxlint-disable-next-line no-map-spread -- the copy is the point: every caller passes a module-level definition map or a reactive store map, so assigning the id onto the entry writes it back into shared data
  Object.entries<T>(dictionary).map(([id, rest]) => ({ ...rest, [idKey]: id }) as Record<TIdKey, TId> & T);
