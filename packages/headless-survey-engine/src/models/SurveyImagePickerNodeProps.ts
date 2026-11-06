import type { SurveyImageBoxProps } from "#src/models/SurveyImageBoxProps";
import type { SurveyImageChoice } from "#src/models/SurveyImageChoice";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "vue-block-editor-headless";

import { surveyImageBoxPropsShape } from "#src/models/SurveyImageBoxProps";
import { surveyImageChoiceSchema } from "#src/models/SurveyImageChoice";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_CHOICE_COUNT } from "#src/services/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The props of an image picker question: the pictures a respondent picks from, one answer or several, and how each picture is drawn
export interface SurveyImagePickerNodeProps extends SurveyImageBoxProps, SurveyQuestionBaseProps {
  choices: SurveyImageChoice[];
  isLabelVisible: boolean;
  multiSelect: boolean;
}

// Choices are unique by their value, since the value is what the picked answer holds
export const surveyImagePickerNodePropsSchema: z.ZodObject<
  typeof surveyImageBoxPropsShape &
    typeof surveyQuestionBasePropsShape & {
      choices: z.ZodDefault<z.ZodArray<typeof surveyImageChoiceSchema>>;
      isLabelVisible: z.ZodDefault<z.ZodBoolean>;
      multiSelect: z.ZodDefault<z.ZodBoolean>;
    }
> = z.object({
  ...surveyQuestionBasePropsShape,
  ...surveyImageBoxPropsShape,
  choices: createUniqueArraySchema(surveyImageChoiceSchema, "value").max(MAX_SURVEY_CHOICE_COUNT).default([]),
  isLabelVisible: z.boolean().default(true),
  multiSelect: z.boolean().default(false),
}) satisfies z.ZodType<OwnProps<SurveyImagePickerNodeProps>>;
