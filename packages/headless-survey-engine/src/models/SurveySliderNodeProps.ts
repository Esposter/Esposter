import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "vue-block-editor-headless";

import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { z } from "zod";

// The props of a slider question: the range it spans, the step it moves by and whether its value is shown beside it
export interface SurveySliderNodeProps extends SurveyQuestionBaseProps {
  isValueVisible: boolean;
  max: number;
  min: number;
  step: number;
}

// A step of zero would never move the slider, so the step is positive; a range whose min is above its max is left to the runner to show
export const surveySliderNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    isValueVisible: z.ZodDefault<z.ZodBoolean>;
    max: z.ZodDefault<z.ZodNumber>;
    min: z.ZodDefault<z.ZodNumber>;
    step: z.ZodDefault<z.ZodNumber>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  isValueVisible: z.boolean().default(true),
  max: z.number().default(100),
  min: z.number().default(0),
  step: z.number().positive().default(1),
}) satisfies z.ZodType<OwnProps<SurveySliderNodeProps>>;
