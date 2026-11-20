import { parseAliasSpecifier } from "#src/services/outdatedDependencies/parseAliasSpecifier";

// The range a specifier names: an npm alias's range, or the specifier itself when it is no alias
export const getSpecifierRange = (specifier: string): string => parseAliasSpecifier(specifier)?.range ?? specifier;
