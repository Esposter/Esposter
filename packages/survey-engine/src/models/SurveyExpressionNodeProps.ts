import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { SurveyExpressionDisplayFormat } from "#src/models/SurveyExpressionDisplayFormat";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { surveyConditionSchema } from "#src/services/surveyConditionSchema";
import { z } from "zod";

const MIN_SURVEY_FRACTION_DIGITS = 0;
const MAX_SURVEY_FRACTION_DIGITS = 10;

// The props of a calculated value: the expression it computes, the format its result is shown in and the decimal places that format keeps
export interface SurveyExpressionNodeProps extends SurveyQuestionBaseProps {
  displayFormat: SurveyExpressionDisplayFormat;
  expression: string;
  maxFractionDigits: number;
}

// A figure past ten decimal places is noise a reader cannot take in, so the places a format keeps are bounded
export const surveyExpressionNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    displayFormat: z.ZodDefault<z.ZodEnum<typeof SurveyExpressionDisplayFormat>>;
    expression: typeof surveyConditionSchema;
    maxFractionDigits: z.ZodDefault<z.ZodInt>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  displayFormat: z.enum(SurveyExpressionDisplayFormat).default(SurveyExpressionDisplayFormat.None),
  expression: surveyConditionSchema,
  maxFractionDigits: z.int().min(MIN_SURVEY_FRACTION_DIGITS).max(MAX_SURVEY_FRACTION_DIGITS).default(2),
}) satisfies z.ZodType<OwnProps<SurveyExpressionNodeProps>>;
