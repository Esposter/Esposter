// A word starts with an ASCII letter or an underscore, so a keyword and a function name read the same on every machine
export const checkIsSurveyExpressionWordStart = (character: string): boolean => /[A-Za-z_]/u.test(character);
