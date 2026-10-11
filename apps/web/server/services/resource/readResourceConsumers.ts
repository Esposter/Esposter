import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { LinkedResource } from "#shared/models/resource/LinkedResource";
import type { ResourceInResource } from "@esposter/db-schema";

import { readLiveOwnedResourceSummaries } from "#server/services/resource/readLiveOwnedResourceSummaries";

// The caller's live resources referencing any of these: one indexed lookup of the link index by target. One among the
// Ids themselves is left out, since deleting it alongside leaves it no reference to miss, and another owner's resource
// Never resolves a reference to these, nor is its name the caller's to read
export const readResourceConsumers = (ctx: AuthedContext, ids: ResourceInResource["id"][]): Promise<LinkedResource[]> =>
  readLiveOwnedResourceSummaries(ctx, { id: { notIn: ids }, links: { targetId: { in: ids } } });
