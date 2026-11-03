import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { z } from "zod";

// The props of a slider question: the range it spans, the step it moves by and whether its value is shown beside it
export interface SurveySliderNodeProps extends SurveyQuestionBaseProps {
  max: number;
  min: number;
  showValue: boolean;
  step: number;
}

// A step of zero would never move the slider, so the step is positive; a range whose min is above its max is left to the runner to show
export const surveySliderNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    max: z.ZodDefault<z.ZodNumber>;
    min: z.ZodDefault<z.ZodNumber>;
    showValue: z.ZodDefault<z.ZodBoolean>;
    step: z.ZodDefault<z.ZodNumber>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  max: z.number().default(100),
  min: z.number().default(0),
  showValue: z.boolean().default(true),
  step: z.number().positive().default(1),
}) satisfies z.ZodType<OwnProps<SurveySliderNodeProps>>;
