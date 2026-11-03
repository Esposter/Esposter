import type { SurveyChoice } from "#src/models/SurveyChoice";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyChoiceSchema } from "#src/models/SurveyChoice";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_CHOICE_COUNT } from "#src/services/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The props of a matrix question: a grid whose rows and columns are choices, and whose cell an answer holds one column's value in
export interface SurveyMatrixNodeProps extends SurveyQuestionBaseProps {
  columns: SurveyChoice[];
  isAllRowRequired: boolean;
  rows: SurveyChoice[];
}

// A row and a column are each told apart by their value, since an answer holds the value and a repeated one would be two answers for one
export const surveyMatrixNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    columns: z.ZodDefault<z.ZodArray<typeof surveyChoiceSchema>>;
    isAllRowRequired: z.ZodDefault<z.ZodBoolean>;
    rows: z.ZodDefault<z.ZodArray<typeof surveyChoiceSchema>>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  columns: createUniqueArraySchema(surveyChoiceSchema, "value").max(MAX_SURVEY_CHOICE_COUNT).default([]),
  isAllRowRequired: z.boolean().default(false),
  rows: createUniqueArraySchema(surveyChoiceSchema, "value").max(MAX_SURVEY_CHOICE_COUNT).default([]),
}) satisfies z.ZodType<OwnProps<SurveyMatrixNodeProps>>;
