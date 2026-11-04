import type { BlockNodeProps, OwnProps } from "headless-block-editor";

import { SurveyImageFit } from "#src/models/SurveyImageFit";
import { MAX_SURVEY_IMAGE_SIZE, MAX_SURVEY_TEXT_LENGTH, MAX_SURVEY_URL_LENGTH } from "#src/services/constants";
import { surveyConditionSchema } from "#src/services/surveyConditionSchema";
import { surveyNameSchema } from "#src/services/surveyNameSchema";
import { z } from "zod";

// The props of an image: the picture it loads from, the text a reader without it gets and the box it is drawn in
export interface SurveyImageNodeProps extends BlockNodeProps {
  altText: string;
  imageFit: SurveyImageFit;
  imageHeight?: number;
  imageLink: string;
  imageWidth?: number;
  name: string;
  visibleIf: string;
}

// An empty alt text marks the picture as decoration, so it is the empty string and not an absent one
export const surveyImageNodePropsSchema: z.ZodObject<{
  altText: z.ZodDefault<z.ZodString>;
  imageFit: z.ZodDefault<z.ZodEnum<typeof SurveyImageFit>>;
  imageHeight: z.ZodOptional<z.ZodInt>;
  imageLink: z.ZodDefault<z.ZodString>;
  imageWidth: z.ZodOptional<z.ZodInt>;
  name: typeof surveyNameSchema;
  visibleIf: typeof surveyConditionSchema;
}> = z.object({
  altText: z.string().max(MAX_SURVEY_TEXT_LENGTH).default(""),
  imageFit: z.enum(SurveyImageFit).default(SurveyImageFit.Contain),
  imageHeight: z.int().positive().max(MAX_SURVEY_IMAGE_SIZE).optional(),
  imageLink: z.string().max(MAX_SURVEY_URL_LENGTH).default(""),
  imageWidth: z.int().positive().max(MAX_SURVEY_IMAGE_SIZE).optional(),
  name: surveyNameSchema,
  visibleIf: surveyConditionSchema,
}) satisfies z.ZodType<OwnProps<SurveyImageNodeProps>>;
