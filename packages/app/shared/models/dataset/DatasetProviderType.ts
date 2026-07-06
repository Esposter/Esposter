import { z } from "zod";

export enum DatasetProviderType {
  SurveyResponses = "SurveyResponses",
}

export const datasetProviderTypeSchema = z.enum(DatasetProviderType) satisfies z.ZodType<DatasetProviderType>;
