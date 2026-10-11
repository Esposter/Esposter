import type { DeepOmit } from "#src/util/types/DeepOmit";

// Only an object tagged `Object` is walked, so a class instance and a reactive proxy of one are walked as a plain object
// Built-ins that carry internal slots (Date, Map, Set, RegExp, typed arrays, Promise, Blob) and functions are kept by reference
const checkIsWalkable = (value: unknown): value is object =>
  Object.prototype.toString.call(value) === "[object Object]";

const omitValue = (value: unknown, omittedKeys: ReadonlySet<string>): unknown => {
  if (Array.isArray(value)) return value.map((element: unknown) => omitValue(element, omittedKeys));
  if (!checkIsWalkable(value)) return value;

  const omittedValue: Record<string, unknown> = {};
  for (const [key, propertyValue] of Object.entries(value))
    if (!omittedKeys.has(key)) omittedValue[key] = omitValue(propertyValue, omittedKeys);
  return omittedValue;
};

// The walk copies every walked object, so the input is never mutated and a repeated call over an unchanged state returns
// Values that compare equal. The one cast is the mapping the compiler cannot follow: `DeepOmit` is its declared shape.
export const omitDeep = <T, TKey extends string>(value: T, ...keys: TKey[]) =>
  omitValue(value, new Set<string>(keys)) as DeepOmit<T, TKey>;
