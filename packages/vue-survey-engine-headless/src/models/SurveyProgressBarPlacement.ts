// Where a survey draws its progress bar, or that it draws none
export const SurveyProgressBarPlacement = { Bottom: "bottom", Off: "off", Top: "top" } as const;
export type SurveyProgressBarPlacement = (typeof SurveyProgressBarPlacement)[keyof typeof SurveyProgressBarPlacement];
