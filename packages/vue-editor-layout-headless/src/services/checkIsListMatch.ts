// Whether a value matches a condition's list. A list that is missing or empty names no value, so it matches any value
export const checkIsListMatch = (list: string[] | undefined, value: string): boolean =>
  !list?.length || list.includes(value);
