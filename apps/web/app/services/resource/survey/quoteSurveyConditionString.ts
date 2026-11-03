// A quote and a backslash are escaped with a backslash, the only two escapes the expression language reads in a string
const SURVEY_STRING_ESCAPE_REGEX = /['\\]/gu;

export const quoteSurveyConditionString = (value: string): string =>
  `'${value.replaceAll(SURVEY_STRING_ESCAPE_REGEX, (character) => `\\${character}`)}'`;
