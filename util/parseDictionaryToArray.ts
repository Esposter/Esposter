export const parseDictionaryToArray = <TId extends string, T extends object>(dictionary: Record<TId, T>) =>
  Object.entries(dictionary).map(([id, rest]) => ({ id: id as TId, ...(rest as T) }));
