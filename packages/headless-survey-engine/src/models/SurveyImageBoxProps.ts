import { SurveyImageFit } from "#src/models/SurveyImageFit";
import { MAX_SURVEY_IMAGE_SIZE } from "#src/services/constants";
import { z } from "zod";

// The props of the box a picture is drawn in: how the picture fills it, and its width and height in pixels when it is sized
export interface SurveyImageBoxProps {
  imageFit: SurveyImageFit;
  imageHeight?: number;
  imageWidth?: number;
}

// Each size is optional, so a box left unsized takes the picture's own size
export const surveyImageBoxPropsShape: {
  imageFit: z.ZodDefault<z.ZodEnum<typeof SurveyImageFit>>;
  imageHeight: z.ZodOptional<z.ZodInt>;
  imageWidth: z.ZodOptional<z.ZodInt>;
} = {
  imageFit: z.enum(SurveyImageFit).default(SurveyImageFit.Contain),
  imageHeight: z.int().positive().max(MAX_SURVEY_IMAGE_SIZE).optional(),
  imageWidth: z.int().positive().max(MAX_SURVEY_IMAGE_SIZE).optional(),
};
