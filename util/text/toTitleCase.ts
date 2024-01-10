export const toTitleCase = (string: string) => string.toLowerCase().replaceAll(/\b\w/g, (s) => s.toUpperCase());
