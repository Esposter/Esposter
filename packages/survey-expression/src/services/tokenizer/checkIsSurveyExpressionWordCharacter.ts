// A word continues with the characters it starts with, and with digits
export const checkIsSurveyExpressionWordCharacter = (character: string): boolean => /[\dA-Za-z_]/u.test(character);
