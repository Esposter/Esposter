import { checkIsEnumValue, InvalidOperationError, Operation } from "@esposter/shared";

// An attribute holding one of an enum's values is read as that value, and any other value is refused by name
export const parseEnumAttribute = <T extends string>(
  operation: string,
  label: string,
  enumObject: Record<string, T>,
  value: string | undefined,
): T | undefined => {
  if (value === undefined) return undefined;
  if (checkIsEnumValue(enumObject, value)) return value;
  throw new InvalidOperationError(Operation.Read, operation, `${value} is not a supported ${label}`);
};
