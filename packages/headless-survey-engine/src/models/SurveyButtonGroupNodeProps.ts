import type { SurveyChoicesProps } from "#src/models/SurveyChoicesProps";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyChoicesPropsShape } from "#src/models/SurveyChoicesProps";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { z } from "zod";

// The props of a button group: one choice of its list, each shown as a button
export interface SurveyButtonGroupNodeProps extends SurveyChoicesProps, SurveyQuestionBaseProps {}

export const surveyButtonGroupNodePropsSchema: z.ZodObject<
  typeof surveyChoicesPropsShape & typeof surveyQuestionBasePropsShape
> = z.object({ ...surveyQuestionBasePropsShape, ...surveyChoicesPropsShape }) satisfies z.ZodType<
  OwnProps<SurveyButtonGroupNodeProps>
>;
