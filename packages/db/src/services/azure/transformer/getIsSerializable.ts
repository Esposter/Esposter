export const getIsSerializable = (value: unknown) =>
  Array.isArray(value) || (typeof value === "object" && !(value instanceof Date));
