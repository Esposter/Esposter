import type { SurveyChoiceOptionsProps } from "#src/models/SurveyChoiceOptionsProps";
import type { SurveyNoneChoiceProps } from "#src/models/SurveyNoneChoiceProps";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyChoiceOptionsPropsShape } from "#src/models/SurveyChoiceOptionsProps";
import { surveyNoneChoicePropsShape } from "#src/models/SurveyNoneChoiceProps";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_TEXT_LENGTH } from "#src/services/constants";
import { z } from "zod";

// The props of a checkbox question: any number of choices of its list, with the bounds on how many it takes
export interface SurveyCheckboxNodeProps
  extends SurveyChoiceOptionsProps, SurveyNoneChoiceProps, SurveyQuestionBaseProps {
  hasSelectAll: boolean;
  maxSelected?: number;
  minSelected?: number;
  selectAllText: string;
}

export const surveyCheckboxNodePropsSchema: z.ZodObject<
  typeof surveyChoiceOptionsPropsShape &
    typeof surveyNoneChoicePropsShape &
    typeof surveyQuestionBasePropsShape & {
      hasSelectAll: z.ZodDefault<z.ZodBoolean>;
      maxSelected: z.ZodOptional<z.ZodInt>;
      minSelected: z.ZodOptional<z.ZodInt>;
      selectAllText: z.ZodDefault<z.ZodString>;
    }
> = z.object({
  ...surveyQuestionBasePropsShape,
  ...surveyChoiceOptionsPropsShape,
  ...surveyNoneChoicePropsShape,
  hasSelectAll: z.boolean().default(false),
  maxSelected: z.int().min(1).optional(),
  minSelected: z.int().min(1).optional(),
  selectAllText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
}) satisfies z.ZodType<OwnProps<SurveyCheckboxNodeProps>>;
