import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { SurveyTextInputType } from "#src/models/SurveyTextInputType";
import { MAX_SURVEY_PATTERN_LENGTH, MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

// The props of a text question: one line of input, typed by its input type, and the bounds its answer is held to
export interface SurveyTextNodeProps extends SurveyQuestionBaseProps {
  inputType: SurveyTextInputType;
  max: string;
  maxLength?: number;
  min: string;
  minLength?: number;
  pattern: string;
  placeholder: string;
}

// The bounds of a number input are text, since the browser reads its min and max as the text an owner typed
export const surveyTextNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    inputType: z.ZodDefault<z.ZodEnum<typeof SurveyTextInputType>>;
    max: z.ZodDefault<z.ZodString>;
    maxLength: z.ZodOptional<z.ZodInt>;
    min: z.ZodDefault<z.ZodString>;
    minLength: z.ZodOptional<z.ZodInt>;
    pattern: z.ZodDefault<z.ZodString>;
    placeholder: z.ZodDefault<z.ZodString>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  inputType: z.enum(SurveyTextInputType).default(SurveyTextInputType.Text),
  max: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  maxLength: z.int().nonnegative().optional(),
  min: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  minLength: z.int().nonnegative().optional(),
  pattern: z.string().max(MAX_SURVEY_PATTERN_LENGTH).default(""),
  placeholder: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
}) satisfies z.ZodType<OwnProps<SurveyTextNodeProps>>;
