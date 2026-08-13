import type { Resource, ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";

// Shared fetch-or-404 for the published view pages. The SSR result rides the payload to the client so
// Hydration never re-issues the read — the public read increments the resource view count, and a
// Re-issued query would double-count every view
// Generic over the content alone, not the whole row: every published read answers `{ content, name }`, and
// Naming that shape is what lets the og tags below read `name` off it
export const useReadPublishedResourceContent = async <TContent>(
  type: ResourceType,
  id: Resource["id"],
  read: () => Promise<{ content: TContent; name: Resource["name"] }>,
  version?: number,
) => {
  const { data } = await useAsyncData(AsyncDataKey.ReadPublishedResourceContent(type, id, version), read);
  if (!data.value)
    throw createError({ statusCode: 404, statusMessage: `${ResourceDefinitionMap[type].title} not found` });
  // Every published view unfurls under the resource it just read, so the og tags belong with the read
  // Rather than restated by each view component
  useSeoMeta({ ogTitle: data.value.name, ogUrl: useRequestURL().href, title: data.value.name });
  return data.value;
};
