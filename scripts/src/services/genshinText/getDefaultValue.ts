import { checkIsPlainObject } from "@esposter/shared";

export const getDefaultValue = (sample: unknown): 0 | [] | false | Record<string, never> | undefined => {
  if (typeof sample === "number") return 0;
  else if (typeof sample === "boolean") return false;
  else if (Array.isArray(sample)) return [];
  else if (checkIsPlainObject(sample)) return {};
  return undefined;
};
