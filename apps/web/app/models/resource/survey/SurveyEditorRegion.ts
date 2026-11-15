// The regions of the survey's editor layout: the bar across the top, the structure beside the canvas and the inspector beyond it
export const SurveyEditorRegion = { Bar: "bar", Inspector: "inspector", Structure: "structure" } as const;
export type SurveyEditorRegion = (typeof SurveyEditorRegion)[keyof typeof SurveyEditorRegion];
