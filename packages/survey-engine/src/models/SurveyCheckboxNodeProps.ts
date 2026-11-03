import type { SurveyChoice } from "#src/models/SurveyChoice";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyChoiceSchema } from "#src/models/SurveyChoice";
import { SurveyChoicesOrder } from "#src/models/SurveyChoicesOrder";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_CHOICE_COUNT, MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The props of a checkbox question: any number of choices of its list, with the bounds on how many it takes
export interface SurveyCheckboxNodeProps extends SurveyQuestionBaseProps {
  choices: SurveyChoice[];
  choicesOrder: SurveyChoicesOrder;
  hasNone: boolean;
  hasOther: boolean;
  hasSelectAll: boolean;
  maxSelected?: number;
  minSelected?: number;
  noneText: string;
  otherText: string;
  selectAllText: string;
}

export const surveyCheckboxNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    choices: z.ZodDefault<z.ZodArray<typeof surveyChoiceSchema>>;
    choicesOrder: z.ZodDefault<z.ZodEnum<typeof SurveyChoicesOrder>>;
    hasNone: z.ZodDefault<z.ZodBoolean>;
    hasOther: z.ZodDefault<z.ZodBoolean>;
    hasSelectAll: z.ZodDefault<z.ZodBoolean>;
    maxSelected: z.ZodOptional<z.ZodInt>;
    minSelected: z.ZodOptional<z.ZodInt>;
    noneText: z.ZodDefault<z.ZodString>;
    otherText: z.ZodDefault<z.ZodString>;
    selectAllText: z.ZodDefault<z.ZodString>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  choices: createUniqueArraySchema(surveyChoiceSchema, "value").max(MAX_SURVEY_CHOICE_COUNT).default([]),
  choicesOrder: z.enum(SurveyChoicesOrder).default(SurveyChoicesOrder.None),
  hasNone: z.boolean().default(false),
  hasOther: z.boolean().default(false),
  hasSelectAll: z.boolean().default(false),
  maxSelected: z.int().min(1).optional(),
  minSelected: z.int().min(1).optional(),
  noneText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  otherText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  selectAllText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
}) satisfies z.ZodType<OwnProps<SurveyCheckboxNodeProps>>;
