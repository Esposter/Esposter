// How a condition's rows join: every row must hold, or any one of them
export const SurveyConditionJoin = { And: "and", Or: "or" } as const;
export type SurveyConditionJoin = (typeof SurveyConditionJoin)[keyof typeof SurveyConditionJoin];
