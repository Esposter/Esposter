import type { Resource } from "@esposter/db-schema";

import { getPropertyNames } from "@esposter/shared";

export interface ResourceListItem extends Resource {
  lastAccessedAt: Date | null;
}

export const ResourceListItemPropertyNames = getPropertyNames<ResourceListItem>();
