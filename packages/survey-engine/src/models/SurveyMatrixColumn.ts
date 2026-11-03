import type { SurveyChoice } from "#src/models/SurveyChoice";

import { surveyChoiceSchema } from "#src/models/SurveyChoice";
import { SurveyMatrixCellType } from "#src/models/SurveyMatrixCellType";
import { MAX_SURVEY_CHOICE_COUNT, MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { surveyNameSchema } from "#src/services/surveyNameSchema";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A column of a matrix question: its name and title, and the kind of cell each row holds in it
export interface SurveyMatrixColumn {
  cellType: SurveyMatrixCellType;
  choices?: SurveyChoice[];
  isRequired: boolean;
  name: string;
  title?: string;
}

export const surveyMatrixColumnSchema: z.ZodObject<{
  cellType: z.ZodEnum<typeof SurveyMatrixCellType>;
  choices: z.ZodOptional<z.ZodArray<typeof surveyChoiceSchema>>;
  isRequired: z.ZodDefault<z.ZodBoolean>;
  name: typeof surveyNameSchema;
  title: z.ZodOptional<z.ZodString>;
}> = z.object({
  cellType: z.enum(SurveyMatrixCellType),
  choices: createUniqueArraySchema(surveyChoiceSchema, "value").max(MAX_SURVEY_CHOICE_COUNT).optional(),
  isRequired: z.boolean().default(false),
  name: surveyNameSchema,
  title: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
}) satisfies z.ZodType<SurveyMatrixColumn>;
