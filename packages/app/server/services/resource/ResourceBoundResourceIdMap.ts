import type { ResourceContent } from "#shared/models/resource/ResourceContent";

import { ResourceType } from "@esposter/db-schema";

// Which content field, if any, a resource type projects onto `resources.boundResourceId`. Only a type that is
// Looked up *by* its binding belongs here — the column exists so a query can find the resources pointing at a
// Target without opening their blobs, and a type nobody searches that way is better left reading its own content.
//
// A Program names the Survey it issues tokens for. `resolveIdentifiedToken` runs on every submission to an
// Identified survey, from an unauthenticated caller holding only a token, and has to establish that some Program
// Bound to *this* survey issued it. Answering that from blob content means reading every Program the owner has
// On every submission; answering it from this column is one indexed row lookup.
export const ResourceBoundResourceIdMap: {
  [TType in ResourceType]?: (content: ResourceContent<TType>) => null | string;
} = {
  // The empty string is the schema's "unbound" default, and the column's is null — a uuid column cannot hold ""
  [ResourceType.Program]: ({ surveyId }) => surveyId || null,
};
