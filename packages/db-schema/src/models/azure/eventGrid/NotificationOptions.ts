import { z } from "zod";

export interface NotificationOptions {
  icon?: null | string;
  title?: null | string;
}

export const notificationOptionsSchema = z.object({
  icon: z.string().nullish(),
  title: z.string().nullish(),
}) satisfies z.ZodType<NotificationOptions>;
