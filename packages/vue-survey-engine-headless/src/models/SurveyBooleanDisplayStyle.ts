// How a yes or no question draws its answer: as a switch, a checkbox or radio buttons
export const SurveyBooleanDisplayStyle = { Checkbox: "checkbox", Radio: "radio", Switch: "switch" } as const;
export type SurveyBooleanDisplayStyle = (typeof SurveyBooleanDisplayStyle)[keyof typeof SurveyBooleanDisplayStyle];
