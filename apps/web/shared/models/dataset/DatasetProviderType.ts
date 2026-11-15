import { z } from "zod";

export const DatasetProviderType = {
  ProgramStatus: "ProgramStatus",
  Sheet: "Sheet",
  SurveyResponses: "SurveyResponses",
} as const;
export type DatasetProviderType = (typeof DatasetProviderType)[keyof typeof DatasetProviderType];

export const datasetProviderTypeSchema = z.enum(DatasetProviderType) satisfies z.ZodType<DatasetProviderType>;
