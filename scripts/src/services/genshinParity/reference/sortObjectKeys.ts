// A value with every object's keys in code point order, arrays kept in their order, so its JSON reads the same on every machine
export const sortObjectKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map((element) => sortObjectKeys(element));
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .toSorted(([first], [second]) => (first < second ? -1 : 1))
      .map(([key, element]) => [key, sortObjectKeys(element)]),
  );
};
