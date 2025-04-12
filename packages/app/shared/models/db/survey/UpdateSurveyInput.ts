import { selectSurveySchema } from "#shared/db/schema/surveys";

export const updateSurveyInputSchema = selectSurveySchema
  .pick("id", "modelVersion")
  .merge(selectSurveySchema.partial().pick("name", "group", "model"));
export type UpdateSurveyInput = typeof updateSurveyInputSchema.infer;
