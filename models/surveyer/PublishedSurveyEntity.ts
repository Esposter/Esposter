import { SurveyEntity, surveySchema } from "@/models/surveyer/SurveyEntity";
import { z } from "zod";

export class PublishedSurveyEntity extends SurveyEntity {
  publishVersion = 0;

  constructor(init: PublishedSurveyEntity) {
    super(init);
    this.publishVersion = init.publishVersion;
  }
}

export const publishedSurveySchema = surveySchema.merge(
  z.object({
    publishVersion: z.number().int().nonnegative(),
  }),
) satisfies z.ZodType<PublishedSurveyEntity>;
