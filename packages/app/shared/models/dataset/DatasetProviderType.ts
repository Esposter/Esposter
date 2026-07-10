import { z } from "zod";

export enum DatasetProviderType {
  File = "File",
  SurveyResponses = "SurveyResponses",
}

export const datasetProviderTypeSchema = z.enum(DatasetProviderType) satisfies z.ZodType<DatasetProviderType>;
