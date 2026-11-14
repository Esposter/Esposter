import type { ProcedureTopics } from "#server/models/trpc/ProcedureTopics";
import type { ReadNotificationsResult } from "#shared/models/db/notification/ReadNotificationsResult";
import type { NotificationInNotification, relations } from "@esposter/db-schema";
import type { RelationsFilter } from "drizzle-orm";

import { ownedBy } from "#server/services/db/ownedBy";
import { getUnreadNotificationsWhere } from "#server/services/notification/getUnreadNotificationsWhere";
import { getCursorPaginationData } from "#server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhere } from "#server/services/pagination/cursor/getCursorWhere";
import { parseSortByToSql } from "#server/services/pagination/sorting/parseSortByToSql";
import { router } from "#server/trpc";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { readNotificationsInputSchema } from "#shared/models/db/notification/ReadNotificationsInput";
import { getTopic } from "#shared/services/realtime/getTopic";
import {
  DatabaseEntityType,
  notificationsInNotification,
  selectNotificationInNotificationSchema,
  TopicKind,
} from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
import { count, eq } from "drizzle-orm";

// The notifications a user holds, and the unread count the bell shows of them, are one topic for the user
const notificationTopics: ProcedureTopics = ({ userId }) =>
  userId === undefined ? [] : [getTopic(TopicKind.Notification, userId)];

export const notificationRouter = router({
  deleteNotification: standardAuthedProcedure
    .meta({ topics: notificationTopics })
    .input(selectNotificationInNotificationSchema.shape.id)
    .mutation<NotificationInNotification>(async ({ ctx, input }) =>
      requireMutation(
        (
          await ctx.db
            .delete(notificationsInNotification)
            .where(ownedBy(notificationsInNotification, input, ctx.getSessionPayload.user.id))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.Notification,
        input,
      ),
    ),
  deleteNotifications: standardAuthedProcedure.meta({ topics: notificationTopics }).mutation<void>(async ({ ctx }) => {
    await ctx.db
      .delete(notificationsInNotification)
      .where(eq(notificationsInNotification.userId, ctx.getSessionPayload.user.id));
  }),
  readNotifications: standardAuthedProcedure
    .meta({ topics: notificationTopics })
    .input(readNotificationsInputSchema)
    .query<ReadNotificationsResult>(async ({ ctx, input: { cursor, limit, sortBy } }) => {
      const userId = ctx.getSessionPayload.user.id;
      const where: RelationsFilter<(typeof relations)["notificationsInNotification"], typeof relations> = {
        userId: { eq: userId },
      };
      if (cursor) where.RAW = (notification) => getCursorWhere(notification, cursor, sortBy);
      // The badge counts every unread row, not the ones a page happens to hold: unread notifications sit on pages
      // The bell has never read, so the total is the server's to state and rides the read the page already costs
      const [resultNotifications, unreadCounts] = await Promise.all([
        ctx.db.query.notificationsInNotification.findMany({
          limit: limit + 1,
          orderBy: (notification) => parseSortByToSql(notification, sortBy),
          where,
        }),
        ctx.db.select({ count: count() }).from(notificationsInNotification).where(getUnreadNotificationsWhere(userId)),
      ]);
      return {
        paginationData: getCursorPaginationData(resultNotifications, limit, sortBy),
        unreadCount: takeOne(unreadCounts).count,
      };
    }),
  updateNotificationsReadStatus: standardAuthedProcedure
    .meta({ topics: notificationTopics })
    .mutation<void>(async ({ ctx }) => {
      await ctx.db
        .update(notificationsInNotification)
        .set({ isRead: true })
        .where(getUnreadNotificationsWhere(ctx.getSessionPayload.user.id));
    }),
});
