import { selectSurveySchema } from "#shared/db/schema/surveys";

export const updateSurveyInputSchema = selectSurveySchema
  .pick("id", "modelVersion")
  .merge(selectSurveySchema.pick("name", "group", "model").partial());
export type UpdateSurveyInput = typeof updateSurveyInputSchema.infer;
