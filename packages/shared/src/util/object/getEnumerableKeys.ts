export const getEnumerableKeys = (value: object): PropertyKey[] =>
  Reflect.ownKeys(value).filter((key) => Object.prototype.propertyIsEnumerable.call(value, key));
