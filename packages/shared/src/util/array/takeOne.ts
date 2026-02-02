interface TakeOne {
  <T extends readonly unknown[]>(values: T, index?: number): T[number];
  <T extends Record<PropertyKey, unknown>>(values: T, index: keyof T): T[keyof T];
}
// Workaround for noUncheckedIndexedAccess
export const takeOne: TakeOne = <T extends readonly unknown[] | Record<PropertyKey, unknown>>(
  values: T,
  index: keyof T = 0,
): T[keyof T] => {
  // We'll cheat a little bit here since the syntax for index accessing and key accessing is the same
  // And we're able to restrict the values passed in based on the overloaded types of the function
  const value = values[index];
  return value as T[keyof T];
};
