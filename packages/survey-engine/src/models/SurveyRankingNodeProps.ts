import type { SurveyChoice } from "#src/models/SurveyChoice";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyChoiceSchema } from "#src/models/SurveyChoice";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_CHOICE_COUNT } from "#src/services/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The props of a ranking question: the choices a respondent puts in the order they prefer
export interface SurveyRankingNodeProps extends SurveyQuestionBaseProps {
  choices: SurveyChoice[];
}

// Choices are unique by their value, since the value is what the ranked answer holds
export const surveyRankingNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & { choices: z.ZodDefault<z.ZodArray<typeof surveyChoiceSchema>> }
> = z.object({
  ...surveyQuestionBasePropsShape,
  choices: createUniqueArraySchema(surveyChoiceSchema, "value").max(MAX_SURVEY_CHOICE_COUNT).default([]),
}) satisfies z.ZodType<OwnProps<SurveyRankingNodeProps>>;
