// Drops the keys whose value is undefined, so a spread over a default keeps the default rather than overwriting it
export const omitUndefined = <T extends object>(object: T) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as Partial<T>;
