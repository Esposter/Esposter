export const toTitleCase = (string: string) => string.toLowerCase().replaceAll(/\b\w/gu, (s) => s.toUpperCase());
