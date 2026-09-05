import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { Resource } from "@esposter/db-schema";

import { readSurveySettings } from "@@/server/services/survey/readSurveySettings";

// Survey's half of ResourceLiveContentMap: the published model a respondent renders stays the immutable
// Snapshot, and only the collection settings are re-applied live
export const reapplySurveyLiveContent = async (
  resource: Resource,
  content: SurveyResource,
): Promise<SurveyResource> => ({
  ...content,
  settings: await readSurveySettings(resource.id),
});
