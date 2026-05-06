export const toTitleCase = (string: string) =>
  string.toLowerCase().replaceAll(new RegExp(String.raw`\b\w`, "gu"), (s) => s.toUpperCase());
