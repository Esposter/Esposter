import type { SurveyChoice } from "#src/models/SurveyChoice";

import { surveyChoiceSchema } from "#src/models/SurveyChoice";
import { MAX_SURVEY_URL_LENGTH } from "#src/services/constants";
import { z } from "zod";

// A choice an image picker offers: a choice whose picture is the link it names
export interface SurveyImageChoice extends SurveyChoice {
  imageLink: string;
}

export const surveyImageChoiceSchema: z.ZodObject<typeof surveyChoiceSchema.shape & { imageLink: z.ZodString }> =
  z.object({
    ...surveyChoiceSchema.shape,
    imageLink: z.string().min(1).max(MAX_SURVEY_URL_LENGTH),
  }) satisfies z.ZodType<SurveyImageChoice>;
