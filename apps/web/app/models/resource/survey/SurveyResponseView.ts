// The Responses blade's two views, after Google Forms: every question summarised, or one response at a time
export const SurveyResponseView = { Individual: "Individual", Summary: "Summary" } as const;
export type SurveyResponseView = (typeof SurveyResponseView)[keyof typeof SurveyResponseView];
