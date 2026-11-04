// A digit is one of the ten decimal characters, and an empty character past the source's end is not one
export const checkIsSurveyExpressionDigit = (character: string): boolean => /\d/u.test(character);
