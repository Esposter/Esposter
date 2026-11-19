import type { z } from "zod";

import { createPageInputSchema, NOTIFICATION_PAGE_SORT } from "@esposter/db-schema";

export const readNotificationsInputSchema = createPageInputSchema(NOTIFICATION_PAGE_SORT).prefault({});
export type ReadNotificationsInput = z.infer<typeof readNotificationsInputSchema>;
