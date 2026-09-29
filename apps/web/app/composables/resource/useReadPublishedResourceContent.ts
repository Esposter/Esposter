import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { getRouteParamString } from "@/util/router/getRouteParamString";

// Shared fetch-or-404 for the published view pages. The SSR result rides the payload to the client so
// Hydration never re-issues the read — the public read increments the resource view count, and a
// Re-issued query would double-count every view
// Generic over the content alone, not the whole row: every published read answers `{ content, name }`, and
// Naming that shape is what lets the og title below read `name` off it
export const useReadPublishedResourceContent = async <TContent>(
  type: ResourceType,
  id: ResourceInResource["id"],
  readLatest: () => Promise<{ content: TContent; name: ResourceInResource["name"] }>,
  // Required, so no view can serve the latest publish under a url that names another version
  readVersion: (version: number) => Promise<{ content: TContent; name: ResourceInResource["name"] }>,
) => {
  const { currentRoute } = useRouter();
  // An owner-only preview param — the view loads that published version instead of the latest. A url with no valid
  // Param gets the latest; one with it reads through the owner-only procedure, so anyone else is rejected server-side
  const versionString = getRouteParamString(currentRoute.value.query.version);
  const parsedVersion = Number(versionString);
  const version = versionString && Number.isInteger(parsedVersion) && parsedVersion > 0 ? parsedVersion : undefined;
  const { data } = await useAsyncData(AsyncDataKey.ReadPublishedResourceContent(type, id, version), () =>
    version ? readVersion(version) : readLatest(),
  );
  if (!data.value)
    throw createError({ statusCode: 404, statusMessage: `${ResourceDefinitionMap[type].title} not found` });
  // Every published view unfurls under the resource it just read, so the og title belongs with the read
  // Rather than restated by each view component
  useSeoMeta({ ogTitle: data.value.name, title: data.value.name });
  return data.value;
};
