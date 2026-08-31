import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { Resource } from "@esposter/db-schema";

import { readSurveySettings } from "@@/server/services/survey/readSurveySettings";

// Collection settings are live state, not snapshot state: the published model a respondent renders stays the
// Immutable snapshot, while closing the survey or switching its response mode takes effect on the very next
// Read of it — and on a restore, which must not put a closed survey's frozen settings back over a working copy
export const reapplySurveyLiveContent = async (
  resource: Resource,
  content: SurveyResource,
): Promise<SurveyResource> => ({
  ...content,
  settings: await readSurveySettings(resource.id),
});
