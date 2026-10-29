import { checkIsPlainObject } from "@esposter/shared";

// The import condition's entry, else the require condition's, else `main`: the file a package's runtime loads
export const readCondition = (value: unknown, condition: string): string | undefined => {
  if (typeof value === "string") return value;
  if (!checkIsPlainObject(value)) return undefined;

  const target = value[condition];
  if (typeof target === "string") return target;
  return checkIsPlainObject(target) && typeof target.default === "string" ? target.default : undefined;
};
