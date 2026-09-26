import type { SurveySettings } from "#shared/models/resource/survey/SurveySettings";
import type { ToData } from "@esposter/shared";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { z } from "zod";

export interface SurveyResource {
  model: string;
  settings: SurveySettings;
}
// Object wrapper (not a bare string schema) so future fields extend without a blob-shape break
export const surveyResourceSchema = z.object({
  model: z.string().max(MAX_RESOURCE_CONTENT_SIZE),
  // Prefaulted so surveys authored before settings existed still parse into today's shape
  settings: surveySettingsSchema.prefault({}),
}) satisfies z.ZodType<ToData<SurveyResource>>;
