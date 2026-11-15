// The orders a choice question lists its choices in, where none keeps the order its owner gave them
export const SurveyChoicesOrder = { Ascending: "asc", Descending: "desc", None: "none", Random: "random" } as const;
export type SurveyChoicesOrder = (typeof SurveyChoicesOrder)[keyof typeof SurveyChoicesOrder];
