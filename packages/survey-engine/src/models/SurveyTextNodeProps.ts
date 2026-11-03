import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { SurveyTextInputType } from "#src/models/SurveyTextInputType";
import { MAX_SURVEY_PATTERN_LENGTH, MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

// The props of a text question: one line of input, typed by its input type, and the bounds its answer is held to
export interface SurveyTextNodeProps extends SurveyQuestionBaseProps {
  inputType: SurveyTextInputType;
  max?: string;
  maxLength?: number;
  min?: string;
  minLength?: number;
  pattern?: string;
  placeholder?: string;
}

// The bounds of a number input are text, since the browser reads its min and max as the text an owner typed
export const surveyTextNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    inputType: z.ZodDefault<z.ZodEnum<typeof SurveyTextInputType>>;
    max: z.ZodOptional<z.ZodString>;
    maxLength: z.ZodOptional<z.ZodInt>;
    min: z.ZodOptional<z.ZodString>;
    minLength: z.ZodOptional<z.ZodInt>;
    pattern: z.ZodOptional<z.ZodString>;
    placeholder: z.ZodOptional<z.ZodString>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  inputType: z.enum(SurveyTextInputType).default(SurveyTextInputType.Text),
  max: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
  maxLength: z.int().nonnegative().optional(),
  min: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
  minLength: z.int().nonnegative().optional(),
  pattern: z.string().max(MAX_SURVEY_PATTERN_LENGTH).optional(),
  placeholder: z.string().max(MAX_SURVEY_TEXT_LENGTH).optional(),
}) satisfies z.ZodType<OwnProps<SurveyTextNodeProps>>;
