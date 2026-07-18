import type { Resource, ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";

// Shared fetch-or-404 for the published view pages. The SSR result rides the payload to the client so
// Hydration never re-issues the read — the public read increments the resource view count, and a
// Re-issued query would double-count every view
export const useReadPublishedResourceContent = async <T>(
  type: ResourceType,
  id: Resource["id"],
  read: () => Promise<T>,
  version?: number,
) => {
  const { data } = await useAsyncData(AsyncDataKey.ReadPublishedResourceContent(type, id, version), read);
  if (!data.value)
    throw createError({ statusCode: 404, statusMessage: `${ResourceDefinitionMap[type].title} not found` });
  return data.value;
};
