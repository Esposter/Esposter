import { toComparable } from "#src/services/search/toComparable";

export const compareValues = (firstValue: unknown, secondValue: unknown): number => {
  const firstComparable = toComparable(firstValue);
  const secondComparable = toComparable(secondValue);
  if (typeof firstComparable === "number" && typeof secondComparable === "number")
    return firstComparable - secondComparable;
  else return String(firstComparable).localeCompare(String(secondComparable));
};
