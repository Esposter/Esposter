import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { AuthedContext } from "@@/server/models/auth/AuthedContext";

import { DatasetProviderMap } from "@@/server/services/dataset/DatasetProviderMap";
import { requireOwnedResource } from "@@/server/services/resource/requireOwnedResource";

// The one way into a provider: a reference resolves to a resource the caller owns, of the type its provider reads,
// Before the provider sees it — so a provider has no ownership check of its own to forget
export const readDataset = async (ctx: AuthedContext, { id, type }: DatasetReference): Promise<Dataset> => {
  const { read, resourceType } = DatasetProviderMap[type];
  return read(await requireOwnedResource(ctx, id, resourceType));
};
