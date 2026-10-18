// A name resolves only as an own entry of the record, never through the prototype chain
// So a name the record does not hold is undefined, even where the prototype has a property of that name
export const getOwnValue = <T>(record: Readonly<Record<string, T>>, key: string): T | undefined =>
  Object.hasOwn(record, key) ? record[key] : undefined;
