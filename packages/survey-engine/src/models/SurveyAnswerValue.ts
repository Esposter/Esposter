// What a respondent's answer holds: text, a number, a boolean, a list of answers, or a record from a name to an answer.
// A matrix, a multiple text, a dynamic matrix and a dynamic panel answer with a record
export type SurveyAnswerValue = boolean | number | string | SurveyAnswerValue[] | { [name: string]: SurveyAnswerValue };
