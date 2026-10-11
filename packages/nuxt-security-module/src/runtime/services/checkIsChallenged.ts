import type { BasicAuthOptions } from "#src/models/BasicAuthOptions";

// A path is challenged unless an exclude matches it and no include does.
// An include wins over an exclude, and every include is checked, so a second listed path is protected as the first is
export const checkIsChallenged = (path: string, { exclude = [], include = [] }: BasicAuthOptions): boolean => {
  const isIncluded = include.some((prefix) => path.startsWith(prefix));
  const isExcluded = exclude.some((prefix) => path.startsWith(prefix));
  return isIncluded || !isExcluded;
};
