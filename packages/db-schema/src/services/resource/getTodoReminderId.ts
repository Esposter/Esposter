import type { ResourceInResource } from "#src/schema/resource/resourcesInResource";

import { ID_SEPARATOR } from "@esposter/shared";

// One Scheduler object per item, so an item's reminder is found again by the item rather than by a stored handle. The app
// and the cutover's reschedule both name it through here
export const getTodoReminderId = (resourceId: ResourceInResource["id"], itemId: string) =>
  `${resourceId}${ID_SEPARATOR}${itemId}`;
