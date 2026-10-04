import { parseAliasSpecifier } from "#src/services/outdatedDependencies/parseAliasSpecifier";

export const getSpecifierBase = (specifier: string): string => {
  const range = parseAliasSpecifier(specifier)?.range ?? specifier;
  return range.replace(/^[\^~>=< ]+/u, "");
};
