export const structuredCloneClass = <T extends object>(klass: T) =>
  Object.assign<T, T>(Object.create(Object.getPrototypeOf(klass)), klass);
