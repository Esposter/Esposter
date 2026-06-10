import { z } from "zod";

export interface FriendRequestNotificationEventGridData {
  notificationOptions: {
    icon?: null | string;
    title?: null | string;
  };
  receiverId: string;
}

export const friendRequestNotificationEventGridDataSchema = z.object({
  notificationOptions: z.object({
    icon: z.string().nullish(),
    title: z.string().nullish(),
  }),
  receiverId: z.string(),
}) satisfies z.ZodType<FriendRequestNotificationEventGridData>;
