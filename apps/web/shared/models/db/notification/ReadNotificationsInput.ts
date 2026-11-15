import type { z } from "zod";

import { NOTIFICATION_PAGE_SORT } from "#shared/services/notification/constants";
import { createPageInputSchema } from "@esposter/db-schema";

export const readNotificationsInputSchema = createPageInputSchema(NOTIFICATION_PAGE_SORT).prefault({});
export type ReadNotificationsInput = z.infer<typeof readNotificationsInputSchema>;
