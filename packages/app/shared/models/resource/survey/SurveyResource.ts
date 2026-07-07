import { z } from "zod";

export interface SurveyResource {
  model: string;
}

// Object wrapper (not a bare string schema) so future fields extend without a blob-shape break
export const surveyResourceSchema = z.object({
  model: z.string(),
}) satisfies z.ZodType<SurveyResource>;
