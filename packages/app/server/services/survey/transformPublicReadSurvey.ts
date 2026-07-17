import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { PublishableResourceProcedureOptions } from "@@/server/models/resource/PublishableResourceProcedureOptions";

import { readSurveySettings } from "@@/server/services/survey/readSurveySettings";
import { transformReadBlobUrls } from "@@/server/services/resource/transformReadBlobUrls";
// Collection settings are live state, not snapshot state: the published model the respondent renders stays
// The immutable snapshot (re-signed so its asset urls never expire), while closing or switching mode takes
// Effect on the very next read
export const transformPublicReadSurvey: NonNullable<
  PublishableResourceProcedureOptions<SurveyResource>["transformPublicReadContent"]
> = async (ctx, resource, content) => ({
  ...(await transformReadBlobUrls(ctx, resource, content)),
  settings: await readSurveySettings(resource.id),
});
