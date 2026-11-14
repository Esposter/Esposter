import type { ResourceInResource } from "@esposter/db-schema";

import { ID_SEPARATOR } from "@esposter/shared";

// One Scheduler object per item, so an item's reminder is found again by the item rather than by a stored handle
export const getTodoReminderId = (resourceId: ResourceInResource["id"], itemId: string) =>
  `${resourceId}${ID_SEPARATOR}${itemId}`;
