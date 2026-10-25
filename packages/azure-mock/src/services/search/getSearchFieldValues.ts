import { deserializeKey } from "@esposter/azure";

export const getSearchFieldValues = (value: unknown, pathSegments: string[]): unknown[] => {
  if (pathSegments.length === 0) return [value];
  else if (Array.isArray(value)) return value.flatMap((item) => getSearchFieldValues(item, pathSegments));
  else if (typeof value === "object" && value !== null) {
    const [field = "", ...remainingPathSegments] = pathSegments;
    return getSearchFieldValues((value as Record<string, unknown>)[deserializeKey(field)], remainingPathSegments);
  } else return [];
};
