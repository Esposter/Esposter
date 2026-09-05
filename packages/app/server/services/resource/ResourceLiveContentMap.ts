import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { Resource } from "@esposter/db-schema";

import { reapplySurveyLiveContent } from "@@/server/services/survey/reapplySurveyLiveContent";
import { ResourceType } from "@esposter/db-schema";

// Which parts of a type's content are live state rather than snapshot state. A snapshot freezes content, but
// Not every field in it is meant to be frozen: Survey's `model` is what a respondent renders and must never
// Change under an already-published link, while its `settings` decide whether the survey is still collecting and
// Under which response mode, so those take effect on the next read rather than the next publish. Declared here,
// It applies on every path that reconstitutes content from a snapshot: the public read, the owner's version
// Preview and the restore (/docs/platform/resource-snapshots)
export const ResourceLiveContentMap: {
  [TType in ResourceType]?: (resource: Resource, content: ResourceContent<TType>) => Promise<ResourceContent<TType>>;
} = {
  [ResourceType.Survey]: reapplySurveyLiveContent,
};
