import type { SurveyChoice } from "#src/models/SurveyChoice";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyChoiceSchema } from "#src/models/SurveyChoice";
import { SurveyChoicesOrder } from "#src/models/SurveyChoicesOrder";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_CHOICE_COUNT, MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The props of a radio group: one choice of its list, with an other and a none answer each typed as text of its own
export interface SurveyRadioGroupNodeProps extends SurveyQuestionBaseProps {
  choices: SurveyChoice[];
  choicesOrder: SurveyChoicesOrder;
  hasNone: boolean;
  hasOther: boolean;
  noneText: string;
  otherText: string;
}

export const surveyRadioGroupNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    choices: z.ZodDefault<z.ZodArray<typeof surveyChoiceSchema>>;
    choicesOrder: z.ZodDefault<z.ZodEnum<typeof SurveyChoicesOrder>>;
    hasNone: z.ZodDefault<z.ZodBoolean>;
    hasOther: z.ZodDefault<z.ZodBoolean>;
    noneText: z.ZodDefault<z.ZodString>;
    otherText: z.ZodDefault<z.ZodString>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  choices: createUniqueArraySchema(surveyChoiceSchema, "value").max(MAX_SURVEY_CHOICE_COUNT).default([]),
  choicesOrder: z.enum(SurveyChoicesOrder).default(SurveyChoicesOrder.None),
  hasNone: z.boolean().default(false),
  hasOther: z.boolean().default(false),
  noneText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  otherText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
}) satisfies z.ZodType<OwnProps<SurveyRadioGroupNodeProps>>;
