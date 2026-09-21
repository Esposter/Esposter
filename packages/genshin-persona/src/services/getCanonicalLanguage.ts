// A language as the data package spells it, matched however the person typed it; nothing when it names none of them
export const getCanonicalLanguage = <T extends string>(languageNames: T[], name: string): T | undefined =>
  languageNames.find((languageName) => languageName.toLowerCase() === name.toLowerCase());
