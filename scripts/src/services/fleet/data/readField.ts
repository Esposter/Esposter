import { InvalidOperationError, Operation } from "@esposter/shared";

// A peer's field as a string; a field the peers file leaves out is "", which the copy reads as absent
export const readField = (name: string, values: Map<string, unknown>, field: string): string => {
  const value = values.get(field) ?? "";
  if (typeof value !== "string") throw new InvalidOperationError(Operation.Read, name, `its ${field} is not a string`);
  return value;
};
