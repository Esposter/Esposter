import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { ResourceContentUpdate } from "#server/models/resource/ResourceContentUpdate";
import type { SavedResourceContentUpdate } from "#server/models/resource/SavedResourceContentUpdate";
import type { ResourceInResource } from "@esposter/db-schema";

import { MAX_CONTENT_UPDATE_ATTEMPTS } from "#server/services/resource/constants";
import { readStoredResourceContent } from "#server/services/resource/readStoredResourceContent";
import { requireOwnedResource } from "#server/services/resource/requireOwnedResource";
import { saveResourceContent } from "#server/services/resource/saveResourceContent";
import { STALE_CONTENT_VERSION_ERROR_MESSAGE } from "#shared/services/resource/constants";
import { ResourceActivityType } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// Reads the stored content after the row, hands it to `update` and saves what it makes of it at the version read, so a
// Write from the server never lands over a save it did not see. Pinned to a version, the update is refused as stale
// Once the row has moved past it, before or during the save. Unpinned, a save landing in between makes this one stale,
// And the content is read again and the update reapplied to it a bounded number of times, rather than written over
export const updateResourceContent = async <T>(
  ctx: AuthedContext,
  resource: ResourceInResource,
  update: (storedContent: unknown) => ResourceContentUpdate<T>,
  contentVersion?: number,
  attempt = 1,
): Promise<SavedResourceContentUpdate<T>> => {
  if (contentVersion !== undefined && contentVersion !== resource.contentVersion)
    throw new TRPCError({ code: "BAD_REQUEST", message: STALE_CONTENT_VERSION_ERROR_MESSAGE });

  const storedResourceContent = await readStoredResourceContent(resource.id);
  const { content, result } = update(storedResourceContent);
  const savedResource = await getResultAsync(() =>
    saveResourceContent(ctx, {
      activityType: ResourceActivityType.ContentSaved,
      content,
      contentVersion: resource.contentVersion,
      resource,
    }),
  ).match<ResourceInResource | undefined>(
    (updatedResource) => updatedResource,
    (error) => {
      if (
        contentVersion === undefined &&
        attempt < MAX_CONTENT_UPDATE_ATTEMPTS &&
        error.message === STALE_CONTENT_VERSION_ERROR_MESSAGE
      )
        return undefined;
      throw error;
    },
  );
  if (savedResource) return { resource: savedResource, result };

  const latestResource = await requireOwnedResource(ctx, resource.id, resource.type);
  return updateResourceContent(ctx, latestResource, update, contentVersion, attempt + 1);
};
