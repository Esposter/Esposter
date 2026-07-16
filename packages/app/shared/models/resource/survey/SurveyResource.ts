import type { SurveySettings } from "#shared/models/resource/survey/SurveySettings";
import type { ToData } from "@esposter/shared";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { z } from "zod";

export interface SurveyResource {
  model: string;
  settings: SurveySettings;
}

// Object wrapper (not a bare string schema) so future fields extend without a blob-shape break
export const surveyResourceSchema = z.object({
  model: z.string(),
  // Prefaulted so surveys authored before settings existed still parse into today's shape
  settings: surveySettingsSchema.prefault({}),
}) satisfies z.ZodType<ToData<SurveyResource>>;
