import type { SurveySettings } from "#shared/models/resource/survey/SurveySettings";
import type { ToData } from "@esposter/shared";

import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { getResult } from "@esposter/shared";
import { z } from "zod";

export interface SurveyResource {
  model: string;
  settings: SurveySettings;
}

// SurveyJS owns the model's finer rules; the server only guarantees it is serialized JSON with an object root
const surveyModelSchema = z
  .string()
  .max(MAX_RESOURCE_CONTENT_SIZE)
  .superRefine((model, ctx) => {
    if (!model) return;

    getResult(() => {
      // oxlint-disable-next-line no-restricted-properties -- SurveyJS model strings may contain ISO-shaped text that a date reviver would mutate
      const surveyModel: unknown = JSON.parse(model);
      return surveyModel;
    }).match(
      (surveyModel) => {
        if (surveyModel === null || typeof surveyModel !== "object" || Array.isArray(surveyModel))
          ctx.addIssue({ code: "custom", message: "Survey model must be a JSON object" });
      },
      (error) => ctx.addIssue({ code: "custom", message: error.message }),
    );
  });

// Object wrapper (not a bare string schema) so future fields extend without a blob-shape break
export const surveyResourceSchema = z.object({
  model: surveyModelSchema,
  // Prefaulted so surveys authored before settings existed still parse into today's shape
  settings: surveySettingsSchema.prefault({}),
}) satisfies z.ZodType<ToData<SurveyResource>>;
