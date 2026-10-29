import { checkIsFile } from "#src/services/dependencies/score/checkIsFile";
import { IMPLICIT_MODULE_SUFFIXES } from "#src/services/dependencies/score/constants";
import { resolve } from "node:path";

// The file a relative specifier names once its implicit suffix is tried, or undefined when none exists
export const resolveRelativeModule = (directory: string, specifier: string): string | undefined => {
  for (const suffix of IMPLICIT_MODULE_SUFFIXES) {
    const candidate = resolve(directory, `${specifier}${suffix}`);
    if (checkIsFile(candidate)) return candidate;
  }
  return undefined;
};
