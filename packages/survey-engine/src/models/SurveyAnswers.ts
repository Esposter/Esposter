import type { SurveyAnswerValue } from "#src/models/SurveyAnswerValue";

// A respondent's answers, keyed by the name of the question each answers, which is the shape a response record stores
export type SurveyAnswers = Record<string, SurveyAnswerValue>;
