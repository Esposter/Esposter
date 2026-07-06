import { z } from "zod";

export enum DatasetProviderType {
  SurveyResponses = "SurveyResponses",
  TableDocument = "TableDocument",
}

export const datasetProviderTypeSchema = z.enum(DatasetProviderType) satisfies z.ZodType<DatasetProviderType>;
