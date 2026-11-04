import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { SurveyBooleanDisplayStyle } from "#src/models/SurveyBooleanDisplayStyle";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

// The props of a yes or no question: its two labels, and the control that draws its answer
export interface SurveyBooleanNodeProps extends SurveyQuestionBaseProps {
  displayStyle: SurveyBooleanDisplayStyle;
  labelFalse: string;
  labelTrue: string;
}

// The styles in the order the form offers them. The enum keeps its members sorted, so the order is held here
const SURVEY_BOOLEAN_DISPLAY_STYLE_OPTIONS: readonly SurveyBooleanDisplayStyle[] = [
  SurveyBooleanDisplayStyle.Switch,
  SurveyBooleanDisplayStyle.Checkbox,
  SurveyBooleanDisplayStyle.Radio,
];

export const surveyBooleanNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    displayStyle: z.ZodDefault<z.ZodEnum<Record<SurveyBooleanDisplayStyle, SurveyBooleanDisplayStyle>>>;
    labelFalse: z.ZodDefault<z.ZodString>;
    labelTrue: z.ZodDefault<z.ZodString>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  displayStyle: z.enum(SURVEY_BOOLEAN_DISPLAY_STYLE_OPTIONS).default(SurveyBooleanDisplayStyle.Switch),
  labelFalse: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  labelTrue: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
}) satisfies z.ZodType<OwnProps<SurveyBooleanNodeProps>>;
