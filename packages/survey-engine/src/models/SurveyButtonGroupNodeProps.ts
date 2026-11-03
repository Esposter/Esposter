import type { SurveyChoice } from "#src/models/SurveyChoice";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyChoiceSchema } from "#src/models/SurveyChoice";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_CHOICE_COUNT } from "#src/services/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The props of a button group: one choice of its list, each shown as a button
export interface SurveyButtonGroupNodeProps extends SurveyQuestionBaseProps {
  choices: SurveyChoice[];
}

export const surveyButtonGroupNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & { choices: z.ZodDefault<z.ZodArray<typeof surveyChoiceSchema>> }
> = z.object({
  ...surveyQuestionBasePropsShape,
  choices: createUniqueArraySchema(surveyChoiceSchema, "value").max(MAX_SURVEY_CHOICE_COUNT).default([]),
}) satisfies z.ZodType<OwnProps<SurveyButtonGroupNodeProps>>;
