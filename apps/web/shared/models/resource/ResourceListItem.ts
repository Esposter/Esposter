import type { ResourceInResource } from "@esposter/db-schema";

import { getPropertyNames } from "@esposter/shared";

export interface ResourceListItem extends ResourceInResource {
  lastAccessedAt: Date | null;
}

export const ResourceListItemPropertyNames = getPropertyNames<ResourceListItem>();
