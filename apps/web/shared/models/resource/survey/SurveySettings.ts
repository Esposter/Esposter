import type { SurveyResponseMode } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import { MAX_CLOSED_MESSAGE_LENGTH } from "#shared/services/resource/survey/constants";
import { SurveyResponseMode as SurveyResponseModeEnum, surveyResponseModeSchema } from "@esposter/db-schema";
import { createNormalizedStringSchema } from "@esposter/shared";
import { z } from "zod";

// Live collection settings — deliberately in the working content blob, never the publish snapshot,
// So closing or switching mode takes effect without re-publishing every already-sent participant link
export class SurveySettings {
  closedMessage = "";
  isAcceptingResponses = true;
  responseMode: SurveyResponseMode = SurveyResponseModeEnum.Anonymous;
}

export const surveySettingsSchema = z.object({
  closedMessage: createNormalizedStringSchema(MAX_CLOSED_MESSAGE_LENGTH).default(""),
  isAcceptingResponses: z.boolean().default(true),
  responseMode: surveyResponseModeSchema.default(SurveyResponseModeEnum.Anonymous),
}) satisfies z.ZodType<ToData<SurveySettings>>;
