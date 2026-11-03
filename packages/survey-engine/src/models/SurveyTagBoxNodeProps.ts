import type { SurveyChoice } from "#src/models/SurveyChoice";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyChoiceSchema } from "#src/models/SurveyChoice";
import { SurveyChoicesOrder } from "#src/models/SurveyChoicesOrder";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_CHOICE_COUNT, MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The props of a tag box: any number of choices of its list, picked as tags, with a bound on how many it takes
export interface SurveyTagBoxNodeProps extends SurveyQuestionBaseProps {
  choices: SurveyChoice[];
  choicesOrder: SurveyChoicesOrder;
  hasOther: boolean;
  maxSelected?: number;
  otherText: string;
  placeholder: string;
}

export const surveyTagBoxNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    choices: z.ZodDefault<z.ZodArray<typeof surveyChoiceSchema>>;
    choicesOrder: z.ZodDefault<z.ZodEnum<typeof SurveyChoicesOrder>>;
    hasOther: z.ZodDefault<z.ZodBoolean>;
    maxSelected: z.ZodOptional<z.ZodInt>;
    otherText: z.ZodDefault<z.ZodString>;
    placeholder: z.ZodDefault<z.ZodString>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  choices: createUniqueArraySchema(surveyChoiceSchema, "value").max(MAX_SURVEY_CHOICE_COUNT).default([]),
  choicesOrder: z.enum(SurveyChoicesOrder).default(SurveyChoicesOrder.None),
  hasOther: z.boolean().default(false),
  maxSelected: z.int().min(1).optional(),
  otherText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  placeholder: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
}) satisfies z.ZodType<OwnProps<SurveyTagBoxNodeProps>>;
