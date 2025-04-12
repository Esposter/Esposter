import { selectSurveySchema } from "#shared/db/schema/surveys";

export const createSurveyInputSchema = selectSurveySchema.pick("name", "group", "model");
export type CreateSurveyInput = typeof createSurveyInputSchema.infer;
