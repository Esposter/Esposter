// A condition a node holds, each the prop its expression is saved under
export const SurveyConditionProp = { EnableIf: "enableIf", RequiredIf: "requiredIf", VisibleIf: "visibleIf" } as const;
export type SurveyConditionProp = (typeof SurveyConditionProp)[keyof typeof SurveyConditionProp];
