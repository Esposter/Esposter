export const getNames = (text: string, regex: RegExp): string[] => [
  ...new Set(Array.from(text.matchAll(regex), (match) => String(match.groups?.name))),
];
