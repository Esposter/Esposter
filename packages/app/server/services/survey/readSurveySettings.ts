import type { SurveySettings } from "#shared/models/resource/survey/SurveySettings";
import type { Resource } from "@esposter/db-schema";

import { surveyResourceSchema } from "#shared/models/resource/survey/SurveyResource";
import { surveySettingsSchema } from "#shared/models/resource/survey/SurveySettings";
import { readResourceContent } from "@@/server/services/resource/readResourceContent";

// Settings are read live from the working blob, never the publish snapshot, so closing a survey or
// Switching its response mode takes effect without re-publishing every already-sent invite link
export const readSurveySettings = async (id: Resource["id"]): Promise<SurveySettings> => {
  const content = await readResourceContent(surveyResourceSchema, id);
  // A survey saved before settings existed, or never saved at all, collects on the defaults
  return content?.settings ?? surveySettingsSchema.parse({});
};
