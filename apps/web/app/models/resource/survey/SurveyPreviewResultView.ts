// The preview's two views of a completed run: its answers as a table of the Responses blade's cells, or as JSON
export const SurveyPreviewResultView = { Json: "JSON", Table: "Table" } as const;
export type SurveyPreviewResultView = (typeof SurveyPreviewResultView)[keyof typeof SurveyPreviewResultView];
