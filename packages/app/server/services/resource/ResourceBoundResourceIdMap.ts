import type { ResourceContent } from "#shared/models/resource/ResourceContent";

import { ResourceType } from "@esposter/db-schema";

// Which content field, if any, a resource type projects onto `resources.boundResourceId`. Only a type looked up
// By its binding belongs here — the column exists so a query can find the resources pointing at a target without
// Opening their blobs. A Program names the Survey it issues tokens for, and `resolveIdentifiedToken` runs on
// Every submission to an identified survey to establish that some Program bound to that survey issued the token:
// From blob content that is every Program the owner has, from this column one indexed row lookup
export const ResourceBoundResourceIdMap: {
  [TType in ResourceType]?: (content: ResourceContent<TType>) => null | string;
} = {
  // The empty string is the schema's "unbound" default, and the column's is null — a uuid column cannot hold ""
  [ResourceType.Program]: ({ surveyId }) => surveyId || null,
};
