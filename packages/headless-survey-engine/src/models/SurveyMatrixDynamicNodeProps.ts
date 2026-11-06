import type { SurveyMatrixColumn } from "#src/models/SurveyMatrixColumn";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "vue-block-editor-headless";

import { surveyMatrixColumnSchema } from "#src/models/SurveyMatrixColumn";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import {
  MAX_SURVEY_MATRIX_COLUMN_COUNT,
  MAX_SURVEY_MATRIX_ROW_COUNT,
  MAX_SURVEY_TEXT_LENGTH,
} from "#src/services/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The props of a dynamic matrix question: a set of columns, and a list of rows a respondent adds and removes, each row answered in every column
export interface SurveyMatrixDynamicNodeProps extends SurveyQuestionBaseProps {
  addRowText: string;
  columns: SurveyMatrixColumn[];
  maxRowCount: number;
  minRowCount: number;
  removeRowText: string;
  rowCount: number;
}

// A column is told apart by its name, since an answer is keyed by the name and a repeated one would overwrite the other's answer
export const surveyMatrixDynamicNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    addRowText: z.ZodDefault<z.ZodString>;
    columns: z.ZodDefault<z.ZodArray<typeof surveyMatrixColumnSchema>>;
    maxRowCount: z.ZodDefault<z.ZodInt>;
    minRowCount: z.ZodDefault<z.ZodInt>;
    removeRowText: z.ZodDefault<z.ZodString>;
    rowCount: z.ZodDefault<z.ZodInt>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  addRowText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  columns: createUniqueArraySchema(surveyMatrixColumnSchema, "name").max(MAX_SURVEY_MATRIX_COLUMN_COUNT).default([]),
  maxRowCount: z.int().min(1).max(MAX_SURVEY_MATRIX_ROW_COUNT).default(MAX_SURVEY_MATRIX_ROW_COUNT),
  minRowCount: z.int().min(0).max(MAX_SURVEY_MATRIX_ROW_COUNT).default(0),
  removeRowText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  rowCount: z.int().min(0).max(MAX_SURVEY_MATRIX_ROW_COUNT).default(2),
}) satisfies z.ZodType<OwnProps<SurveyMatrixDynamicNodeProps>>;
