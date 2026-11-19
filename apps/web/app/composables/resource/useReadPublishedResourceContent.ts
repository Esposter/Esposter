import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { AsyncDataKey } from "#src/services/shared/AsyncDataKey";
import { parsePositiveInteger } from "#src/services/shared/parsePositiveInteger";
import { getRouteParamString } from "#src/util/router/getRouteParamString";

// The shape every published read answers, generic over its content alone rather than the whole row, so the og title
// Can read `name` off it
interface PublishedResourceRead<TContent> {
  content: TContent;
  name: ResourceInResource["name"];
}

// Shared fetch-or-404 for the published view pages. The SSR result rides the payload to the client so
// Hydration never re-issues the read — the public read increments the resource view count, and a
// Re-issued query would double-count every view
export const useReadPublishedResourceContent = async <TContent>(
  type: ResourceType,
  id: ResourceInResource["id"],
  readLatest: () => Promise<PublishedResourceRead<TContent>>,
  // Required, so no view can serve the latest publish under a url that names another version
  readVersion: (version: number) => Promise<PublishedResourceRead<TContent>>,
) => {
  const { currentRoute } = useRouter();
  // An owner-only preview param — the view loads that published version instead of the latest. A url with no valid
  // Param gets the latest; one with it reads through the owner-only procedure, so anyone else is rejected server-side
  const version = parsePositiveInteger(getRouteParamString(currentRoute.value.query.version));
  const { data } = await useAsyncData(AsyncDataKey.ReadPublishedResourceContent(type, id, version), () =>
    version ? readVersion(version) : readLatest(),
  );
  if (!data.value) throw createError({ status: 404, statusText: `${ResourceDefinitionMap[type].title} not found` });
  // Every published view unfurls under the resource it just read, so the og title belongs with the read
  // Rather than restated by each view component
  useSeoMeta({ ogTitle: data.value.name, title: data.value.name });
  return data.value;
};
