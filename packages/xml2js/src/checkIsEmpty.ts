export const checkIsEmpty = (value: unknown): boolean =>
  typeof value === "object" && value !== null && Object.keys(value).length === 0;
