import { SurveyEntity, surveySchema } from "@/models/surveyer/SurveyEntity";
import { z } from "zod";

export class PublishedSurveyEntity extends SurveyEntity {
  publishVersion = 0;
  publishedAt = new Date();
}

export const publishedSurveySchema = surveySchema.merge(
  z.object({
    publishVersion: z.number().int().nonnegative(),
    publishedAt: z.date(),
  }),
) satisfies z.ZodType<PublishedSurveyEntity>;
