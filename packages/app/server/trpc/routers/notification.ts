import type { Notification, relations } from "@esposter/db-schema";
import type { RelationsFilter } from "drizzle-orm";

import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { ownedBy } from "@@/server/services/db/ownedBy";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "@@/server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, notifications, selectNotificationSchema } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

const readNotificationsInputSchema = createCursorPaginationParamsSchema(selectNotificationSchema.keyof(), [
  CREATED_AT_DESCENDING_SORT_ITEM,
]);

export const notificationRouter = router({
  deleteNotification: standardAuthedProcedure
    .input(selectNotificationSchema.shape.id)
    .mutation<Notification>(async ({ ctx, input }) => {
      const deletedNotification = requireMutation(
        (
          await ctx.db
            .delete(notifications)
            .where(ownedBy(notifications, input, ctx.getSessionPayload.user.id))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.Notification,
        input,
      );
      return deletedNotification;
    }),
  deleteNotifications: standardAuthedProcedure.mutation<void>(async ({ ctx }) => {
    await ctx.db.delete(notifications).where(eq(notifications.userId, ctx.getSessionPayload.user.id));
  }),
  readNotifications: standardAuthedProcedure
    .input(readNotificationsInputSchema)
    .query(async ({ ctx, input: { cursor, limit, sortBy } }) => {
      const where: RelationsFilter<(typeof relations)["notifications"], typeof relations> = {
        userId: { eq: ctx.getSessionPayload.user.id },
      };
      if (cursor) where.RAW = (notification) => getCursorWhere(notification, cursor, sortBy);
      const resultNotifications = await ctx.db.query.notifications.findMany({
        limit: limit + 1,
        orderBy: (notification) => parseSortByToSql(notification, sortBy),
        where,
      });
      return getCursorPaginationData(resultNotifications, limit, sortBy);
    }),
  // One statement for the whole panel: closing it marks everything read, and a per-row write would be one round
  // Trip per notification for a state nothing reads back individually
  updateNotificationsReadStatus: standardAuthedProcedure.mutation<void>(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, ctx.getSessionPayload.user.id), eq(notifications.isRead, false)));
  }),
});
