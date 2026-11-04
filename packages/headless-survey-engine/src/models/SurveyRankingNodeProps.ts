import type { SurveyChoicesProps } from "#src/models/SurveyChoicesProps";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyChoicesPropsShape } from "#src/models/SurveyChoicesProps";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { z } from "zod";

// The props of a ranking question: the choices a respondent puts in the order they prefer
export interface SurveyRankingNodeProps extends SurveyChoicesProps, SurveyQuestionBaseProps {}

export const surveyRankingNodePropsSchema: z.ZodObject<
  typeof surveyChoicesPropsShape & typeof surveyQuestionBasePropsShape
> = z.object({ ...surveyQuestionBasePropsShape, ...surveyChoicesPropsShape }) satisfies z.ZodType<
  OwnProps<SurveyRankingNodeProps>
>;
