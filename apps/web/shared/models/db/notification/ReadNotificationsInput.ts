import type { z } from "zod";

import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { selectNotificationInNotificationSchema } from "@esposter/db-schema";

export const readNotificationsInputSchema = createCursorPaginationParamsSchema(
  selectNotificationInNotificationSchema.keyof(),
  [CREATED_AT_DESCENDING_SORT_ITEM],
).prefault({});
export type ReadNotificationsInput = z.infer<typeof readNotificationsInputSchema>;
