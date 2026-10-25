// A multiplier's constellation is the join key its build reads a talent variable at, which the published shape omits
export const omitConstellation = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map((element) => omitConstellation(element));
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "constellation")
      .map(([key, child]): [string, unknown] => [key, omitConstellation(child)]),
  );
};
