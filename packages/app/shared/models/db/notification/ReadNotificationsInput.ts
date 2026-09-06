import type { z } from "zod";

import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { selectNotificationSchema } from "@esposter/db-schema";

export const readNotificationsInputSchema = createCursorPaginationParamsSchema(selectNotificationSchema.keyof(), [
  CREATED_AT_DESCENDING_SORT_ITEM,
]);
export type ReadNotificationsInput = z.infer<typeof readNotificationsInputSchema>;
