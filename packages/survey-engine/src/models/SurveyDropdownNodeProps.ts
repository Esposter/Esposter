import type { SurveyChoiceOptionsProps } from "#src/models/SurveyChoiceOptionsProps";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyChoiceOptionsPropsShape } from "#src/models/SurveyChoiceOptionsProps";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

// The props of a dropdown: one choice of its list picked from a closed menu, with an other answer typed as text
export interface SurveyDropdownNodeProps extends SurveyChoiceOptionsProps, SurveyQuestionBaseProps {
  placeholder: string;
}

export const surveyDropdownNodePropsSchema: z.ZodObject<
  typeof surveyChoiceOptionsPropsShape &
    typeof surveyQuestionBasePropsShape & { placeholder: z.ZodDefault<z.ZodString> }
> = z.object({
  ...surveyQuestionBasePropsShape,
  ...surveyChoiceOptionsPropsShape,
  placeholder: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
}) satisfies z.ZodType<OwnProps<SurveyDropdownNodeProps>>;
