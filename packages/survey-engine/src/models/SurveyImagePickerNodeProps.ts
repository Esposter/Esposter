import type { SurveyImageChoice } from "#src/models/SurveyImageChoice";
import type { SurveyQuestionBaseProps } from "#src/models/SurveyQuestionBaseProps";
import type { OwnProps } from "headless-block-editor";

import { surveyImageChoiceSchema } from "#src/models/SurveyImageChoice";
import { SurveyImageFit } from "#src/models/SurveyImageFit";
import { surveyQuestionBasePropsShape } from "#src/models/SurveyQuestionBaseProps";
import { MAX_SURVEY_CHOICE_COUNT } from "#src/services/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The props of an image picker question: the pictures a respondent picks from, one answer or several, and how each picture is drawn
export interface SurveyImagePickerNodeProps extends SurveyQuestionBaseProps {
  choices: SurveyImageChoice[];
  imageFit: SurveyImageFit;
  imageHeight?: number;
  imageWidth?: number;
  multiSelect: boolean;
  showLabel: boolean;
}

// Choices are unique by their value, since the value is what the picked answer holds
export const surveyImagePickerNodePropsSchema: z.ZodObject<
  typeof surveyQuestionBasePropsShape & {
    choices: z.ZodDefault<z.ZodArray<typeof surveyImageChoiceSchema>>;
    imageFit: z.ZodDefault<z.ZodEnum<typeof SurveyImageFit>>;
    imageHeight: z.ZodOptional<z.ZodInt>;
    imageWidth: z.ZodOptional<z.ZodInt>;
    multiSelect: z.ZodDefault<z.ZodBoolean>;
    showLabel: z.ZodDefault<z.ZodBoolean>;
  }
> = z.object({
  ...surveyQuestionBasePropsShape,
  choices: createUniqueArraySchema(surveyImageChoiceSchema, "value").max(MAX_SURVEY_CHOICE_COUNT).default([]),
  imageFit: z.enum(SurveyImageFit).default(SurveyImageFit.Contain),
  imageHeight: z.int().positive().optional(),
  imageWidth: z.int().positive().optional(),
  multiSelect: z.boolean().default(false),
  showLabel: z.boolean().default(true),
}) satisfies z.ZodType<OwnProps<SurveyImagePickerNodeProps>>;
