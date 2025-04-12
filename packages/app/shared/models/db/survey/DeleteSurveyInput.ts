import { selectSurveySchema } from "#shared/db/schema/surveys";

export const deleteSurveyInputSchema = selectSurveySchema.get("id");
export type DeleteSurveyInput = typeof deleteSurveyInputSchema.infer;
