import { getSpecifierRange } from "#src/services/outdatedDependencies/getSpecifierRange";

export const getSpecifierBase = (specifier: string): string => getSpecifierRange(specifier).replace(/^[\^~>=< ]+/u, "");
