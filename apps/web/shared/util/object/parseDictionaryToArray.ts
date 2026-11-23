export const parseDictionaryToArray = <TId extends string, TValue extends object, TIdKey extends string = "id">(
  dictionary: Record<TId, TValue>,
  idKey?: TIdKey,
) =>
  // The copy is the point: every caller passes a module-level definition map or a reactive store map, so assigning the
  // Id onto the entry writes it back into shared data
  Object.entries<TValue>(dictionary).map(
    // The id's key is a runtime name, which TypeScript widens to a string index, so no
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Record over TIdKey is assignable from the literal
    ([id, rest]) => ({ ...rest, [idKey ?? "id"]: id }) as Record<TIdKey, TId> & TValue,
  );
