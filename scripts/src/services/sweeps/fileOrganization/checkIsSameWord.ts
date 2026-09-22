// Two words are the same up to number: a values array is its enum's plural (`VoiceLanguages`), a table its
// Row type's (`userStatusesInMessage` beside `UserStatusInMessage`), so each word is read with every plural
// Ending it could carry taken off, and one spelling in common is a match
const getSingulars = (word: string): string[] => [
  word,
  word.replace(/ies$/u, "y"),
  word.replace(/es$/u, ""),
  word.replace(/s$/u, ""),
];

export const checkIsSameWord = (a: string, b: string): boolean =>
  a === b || getSingulars(a).some((singular) => getSingulars(b).includes(singular));
