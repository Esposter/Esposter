import { z } from "zod";

export const NotificationType = { All: "All", DirectMessage: "DirectMessage", Never: "Never" } as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const notificationTypeSchema = z.enum(NotificationType) satisfies z.ZodType<NotificationType>;
