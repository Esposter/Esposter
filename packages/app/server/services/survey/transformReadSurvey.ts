import type { SurveyResource } from "#shared/models/resource/survey/SurveyResource";
import type { PublishableResourceProcedureOptions } from "@@/server/models/resource/PublishableResourceProcedureOptions";

import { useUpdateBlobUrls } from "@@/server/composables/survey/useUpdateBlobUrls";
// Asset SAS urls baked into the model expire, so every owner read re-signs them against the working-copy blobs
export const transformReadSurvey: NonNullable<
  PublishableResourceProcedureOptions<SurveyResource>["transformReadContent"]
> = async (_ctx, _resource, content) => ({ ...content, model: await useUpdateBlobUrls(content.model) });
