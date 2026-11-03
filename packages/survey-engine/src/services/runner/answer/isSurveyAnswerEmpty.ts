// An answer a required question refuses is one with nothing in it: absent, the empty string or an empty list. A yes or no and a zero are answers
export const isSurveyAnswerEmpty = (value: unknown): boolean =>
  value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
