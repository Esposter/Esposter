import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { DatasetProviderMap } from "#server/services/dataset/DatasetProviderMap";
import { readOwnedResource } from "#server/services/resource/readOwnedResource";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { DatabaseEntityType } from "@esposter/db-schema";

// The one way into a provider: a reference resolves to a resource the caller owns, of the type its provider reads,
// Before the provider sees it — so a provider has no ownership check of its own to forget. A reference is a claim held
// In content, so one that resolves to nothing — its source deleted, binned, or never the caller's — is a missing
// Source rather than a refused caller, answered alike so it confirms nothing about anyone else's resource
export const readDataset = async (ctx: AuthedContext, { id, type }: DatasetReference): Promise<Dataset> => {
  const { read, resourceType } = DatasetProviderMap[type];
  const resource = await requireEntity(readOwnedResource(ctx, id, resourceType), DatabaseEntityType.Resource, id);
  return read(ctx.db, resource);
};
