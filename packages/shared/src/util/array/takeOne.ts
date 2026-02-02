interface TakeOne {
  <T>(values: readonly T[], index?: number): T;
  <TKey extends PropertyKey, TValue>(values: Record<TKey, TValue>, index: TKey): TValue;
}
// Workaround for noUncheckedIndexedAccess
export const takeOne: TakeOne = <TKey extends PropertyKey, T>(
  values: readonly T[] | Record<TKey, T>,
  index: number | TKey = 0,
) => {
  // We'll cheat a little bit here since the syntax for index accessing and key accessing is the same
// And we're able to restrict the values passed in based on the overloaded types of the function
  const value = values[index as keyof typeof values];
  return value;
};
