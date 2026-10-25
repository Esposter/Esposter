export const toComparable = (value: unknown): number | string => {
  if (value instanceof Date) return value.getTime();
  else if (typeof value === "number" || typeof value === "string") return value;
  else return String(value);
};
