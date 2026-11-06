import type { SurveyChoiceOptionsProps } from "#src/models/SurveyChoiceOptionsProps";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "vue-block-editor-headless";

import { surveyChoiceOptionsPropsShape } from "#src/models/SurveyChoiceOptionsProps";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

// The props of a tag box: any number of choices of its list, picked as tags, with a bound on how many it takes
export interface SurveyTagBoxNodeProps extends SurveyChoiceOptionsProps, SurveyQuestionBaseProps {
  maxSelected?: number;
  placeholder: string;
}

export const surveyTagBoxNodePropsSchema: z.ZodObject<
  typeof surveyChoiceOptionsPropsShape &
    typeof surveyQuestionBasePropsShape & {
      maxSelected: z.ZodOptional<z.ZodInt>;
      placeholder: z.ZodDefault<z.ZodString>;
    }
> = z.object({
  ...surveyQuestionBasePropsShape,
  ...surveyChoiceOptionsPropsShape,
  maxSelected: z.int().positive().optional(),
  placeholder: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
}) satisfies z.ZodType<OwnProps<SurveyTagBoxNodeProps>>;
