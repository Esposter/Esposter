import type { ItemEntityType } from "@esposter/shared";

import { AppNotificationType } from "#src/models/notification/AppNotificationType";
import { z } from "zod";

// The one notification whose copy is composed by its publisher rather than resolved at delivery. A resource
// Operation's wording depends on what the caller did — one resource or fifty, a version number, the name a row
// Had before it was deleted — none of which survives to delivery time, so the mutation that knows it composes it.
//
// The excluded session is the one that performed the operation. It already showed the toast synchronously, so
// Its own device is the one recipient that must not be pushed; every other session of the same user is.
export interface ResourceOperationNotificationData extends ItemEntityType<AppNotificationType.ResourceOperation> {
  body?: string;
  excludedSessionId?: string;
  path: string;
  title: string;
  userId: string;
}

export const resourceOperationNotificationDataSchema = z.object({
  body: z.string().optional(),
  excludedSessionId: z.string().optional(),
  path: z.string(),
  title: z.string(),
  type: z.literal(AppNotificationType.ResourceOperation).readonly(),
  userId: z.string(),
}) satisfies z.ZodType<ResourceOperationNotificationData>;
