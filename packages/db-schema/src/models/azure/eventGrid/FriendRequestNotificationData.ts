import type { ItemEntityType } from "@esposter/shared";

import { AppNotificationType } from "#src/models/notification/AppNotificationType";
import { z } from "zod";

export interface FriendRequestNotificationData extends ItemEntityType<AppNotificationType.FriendRequest> {
  receiverId: string;
  senderId: string;
}

export const friendRequestNotificationDataSchema = z.object({
  receiverId: z.string(),
  senderId: z.string(),
  type: z.literal(AppNotificationType.FriendRequest).readonly(),
}) satisfies z.ZodType<FriendRequestNotificationData>;
