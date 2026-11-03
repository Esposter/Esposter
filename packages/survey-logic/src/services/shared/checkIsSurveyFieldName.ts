// A text that names a field holds no condition sign, which a filter's condition always holds
export const checkIsSurveyFieldName = (text: string): boolean => !/[{}><=!]/u.test(text);
