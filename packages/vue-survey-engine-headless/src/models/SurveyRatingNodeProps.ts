import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "vue-block-editor-headless";

import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { SurveyRatingType } from "#src/models/SurveyRatingType";
import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

const MIN_SURVEY_RATE_COUNT = 2;
const MAX_SURVEY_RATE_COUNT = 20;

// The props of a rating question: the scale it is drawn as, how many steps it has and the text at either end of them
export interface SurveyRatingNodeProps extends SurveyQuestionBaseProps {
  maxRateDescription: string;
  minRateDescription: string;
  rateCount: number;
  rateType: SurveyRatingType;
}

// A scale of one step asks nothing and one past twenty is more than a respondent reads at a glance, so the step count is bounded
export const surveyRatingNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    maxRateDescription: z.ZodDefault<z.ZodString>;
    minRateDescription: z.ZodDefault<z.ZodString>;
    rateCount: z.ZodDefault<z.ZodInt>;
    rateType: z.ZodDefault<z.ZodEnum<typeof SurveyRatingType>>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  maxRateDescription: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  minRateDescription: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  rateCount: z.int().min(MIN_SURVEY_RATE_COUNT).max(MAX_SURVEY_RATE_COUNT).default(5),
  rateType: z.enum(SurveyRatingType).default(SurveyRatingType.Labels),
}) satisfies z.ZodType<OwnProps<SurveyRatingNodeProps>>;
