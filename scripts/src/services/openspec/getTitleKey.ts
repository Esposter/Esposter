// A title for comparing a scenario's with a test's: the lint rule lowercases a test's first letter, and a test's words
// May differ from the scenario's only in case or punctuation, so only its letters and digits are compared
export const getTitleKey = (title: string): string => title.toLowerCase().replaceAll(/[^\p{L}\p{N}]+/gu, "");
