import { InvalidOperationError, Operation } from "@esposter/shared";

// A command line's comma-separated names, trimmed and with empty entries dropped. One that names nothing is rejected,
// Since a caller reads no names as its default selection and would run on everything the argument never said
export const parseNames = (value: string, name: string): string[] => {
  const names = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (names.length === 0) throw new InvalidOperationError(Operation.Read, name, `${value} names nothing`);
  return names;
};
