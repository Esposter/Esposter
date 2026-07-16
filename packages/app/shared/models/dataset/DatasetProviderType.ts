import { z } from "zod";

export enum DatasetProviderType {
  ProgramStatus = "ProgramStatus",
  Sheet = "Sheet",
  SurveyResponses = "SurveyResponses",
}

export const datasetProviderTypeSchema = z.enum(DatasetProviderType) satisfies z.ZodType<DatasetProviderType>;
