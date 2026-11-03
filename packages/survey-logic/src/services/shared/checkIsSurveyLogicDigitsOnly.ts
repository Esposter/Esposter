const DIGITS_ONLY_REGEX = /^\d+$/u;

// A text of digits alone, which SurveyJS refuses as a number once it is long enough to lose precision
export const checkIsSurveyLogicDigitsOnly = (text: string): boolean => DIGITS_ONLY_REGEX.test(text);
