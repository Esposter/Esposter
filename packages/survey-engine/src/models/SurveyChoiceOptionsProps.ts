import type { SurveyChoicesProps } from "#src/models/SurveyChoicesProps";

import { SurveyChoicesOrder } from "#src/models/SurveyChoicesOrder";
import { surveyChoicesPropsShape } from "#src/models/SurveyChoicesProps";
import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

// What a choice question that lists its choices on screen adds to them: the order they are shown in, and an other answer typed as text
export interface SurveyChoiceOptionsProps extends SurveyChoicesProps {
  choicesOrder: SurveyChoicesOrder;
  hasOther: boolean;
  otherText: string;
}

export const surveyChoiceOptionsPropsShape: typeof surveyChoicesPropsShape & {
  choicesOrder: z.ZodDefault<z.ZodEnum<typeof SurveyChoicesOrder>>;
  hasOther: z.ZodDefault<z.ZodBoolean>;
  otherText: z.ZodDefault<z.ZodString>;
} = {
  ...surveyChoicesPropsShape,
  choicesOrder: z.enum(SurveyChoicesOrder).default(SurveyChoicesOrder.None),
  hasOther: z.boolean().default(false),
  otherText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
};
