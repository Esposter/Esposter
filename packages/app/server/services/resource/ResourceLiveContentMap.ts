import type { ResourceContent } from "#shared/models/resource/ResourceContent";
import type { Resource } from "@esposter/db-schema";

import { reapplySurveyLiveContent } from "@@/server/services/survey/reapplySurveyLiveContent";
import { ResourceType } from "@esposter/db-schema";

// Which parts of a type's content are **live state** rather than snapshot state — the one declaration of a
// Line that would otherwise be drawn once per path and drawn differently each time.
//
// A snapshot freezes content, but not every field in it is meant to be frozen. Survey's `model` is what a
// Respondent renders and must never change under an already-published link; its `settings` decide whether the
// Survey is still collecting and under which response mode, and those have to take effect on the next read
// Rather than on the next publish. Declaring that here makes it apply on **every** path that reconstitutes
// Content from a snapshot — the public read, the owner's version preview, and the restore — instead of on
// Whichever one remembered. Restore is the path that did not: it copied the frozen `settings` back over the
// Working copy, silently reopening a closed survey or flipping the response mode the write boundary makes
// Authorization decisions on. See /docs/platform/resource-snapshots
export const ResourceLiveContentMap: {
  [TType in ResourceType]?: (resource: Resource, content: ResourceContent<TType>) => Promise<ResourceContent<TType>>;
} = {
  [ResourceType.Survey]: reapplySurveyLiveContent,
};
