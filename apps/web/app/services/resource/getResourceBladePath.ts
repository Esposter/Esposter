import type { ResourceBladeSlug } from "@/models/resource/ResourceBladeSlug";
import type { Resource } from "@esposter/db-schema";

import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { RoutePath } from "@esposter/shared";

// Overview is the resource's own path; every other blade hangs off it as a segment.
export const getResourceBladePath = (
  resourceId: Resource["id"],
  slug: ResourceBladeSlug | ResourceBladeType,
): string => {
  const resourcePath = RoutePath.Resource(resourceId);
  return slug === ResourceBladeType.Overview ? resourcePath : `${resourcePath}/${slug}`;
};
