export const getSpecifierBase = (specifier: string): string => specifier.replace(/^[\^~>=< ]+/u, "");
