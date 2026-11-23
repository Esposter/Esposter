import type { DeepOmit } from "#src/util/types/DeepOmit";

// Only an object tagged `Object` is walked.
// So a class instance and a reactive proxy of one are walked as a plain Object.
// Built-ins that carry internal slots (Date, Map, Set, RegExp, typed arrays, Promise, Blob) are kept by reference.
// Functions are kept by reference too.
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

// The walk copies every walked object, so the input is never mutated.
// A repeated call over an unchanged state returns values that compare equal.
// `DeepOmit` is the declared shape of the walk, whose keys are chosen at run time.
export const omitDeep = <T, TKey extends string>(value: T, ...keys: TKey[]) =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- at run time, which the compiler cannot follow
  omitValue(value, new Set<string>(keys)) as DeepOmit<T, TKey>;
