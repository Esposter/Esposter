// A kebab-case package name as the camelCase file and identifier a library's own module is named by
export const toCamelCase = (name: string): string =>
  name.replaceAll(/-(?<character>[a-z\d])/gu, (_match, character: string) => character.toUpperCase());
