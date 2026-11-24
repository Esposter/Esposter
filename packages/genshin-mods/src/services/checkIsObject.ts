// An object that is not null, the shape every record a guard reads its fields from must be before they are read.
export const checkIsObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
