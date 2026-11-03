import type { SurveyChoiceOptionsProps } from "#src/models/SurveyChoiceOptionsProps";
import type { SurveyNoneChoiceProps } from "#src/models/SurveyNoneChoiceProps";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyChoiceOptionsPropsShape } from "#src/models/SurveyChoiceOptionsProps";
import { surveyNoneChoicePropsShape } from "#src/models/SurveyNoneChoiceProps";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { z } from "zod";

// The props of a radio group: one choice of its list, with an other and a none answer each typed as text of its own
export interface SurveyRadioGroupNodeProps
  extends SurveyChoiceOptionsProps, SurveyNoneChoiceProps, SurveyQuestionBaseProps {}

export const surveyRadioGroupNodePropsSchema: z.ZodObject<
  typeof surveyChoiceOptionsPropsShape & typeof surveyNoneChoicePropsShape & typeof surveyQuestionBasePropsShape
> = z.object({
  ...surveyQuestionBasePropsShape,
  ...surveyChoiceOptionsPropsShape,
  ...surveyNoneChoicePropsShape,
}) satisfies z.ZodType<OwnProps<SurveyRadioGroupNodeProps>>;
