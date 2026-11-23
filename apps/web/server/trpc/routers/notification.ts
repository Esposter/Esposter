import type { DeleteNotificationResult } from "#shared/models/db/notification/DeleteNotificationResult";
import type { ReadNotificationsResult } from "#shared/models/db/notification/ReadNotificationsResult";

import { ownedBy } from "#server/services/db/ownedBy";
import { getUnreadNotificationsWhere } from "#server/services/notification/getUnreadNotificationsWhere";
import { selectUnreadNotificationCount } from "#server/services/notification/selectUnreadNotificationCount";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { readNotificationsInputSchema } from "#shared/models/db/notification/ReadNotificationsInput";
import { readNotificationRows, toPage } from "@esposter/db";
import {
  DatabaseEntityType,
  NOTIFICATION_PAGE_SORT,
  notificationsInNotification,
  selectNotificationInNotificationSchema,
} from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
import { and, eq, isNull } from "drizzle-orm";

export const notificationRouter = router({
  // Each write answers the unread count it leaves, read in the same batch, so the bell takes the settled value. A
  // Dismissal Keeps its row as a tombstone, so its version rises and a read that lands later loses to it, and the
  // Answer names the row
  deleteNotification: standardAuthedProcedure
    .input(selectNotificationInNotificationSchema.shape.id)
    .mutation<DeleteNotificationResult>(async ({ ctx, input }) => {
      const [deletedRows, unreadRows] = await ctx.db.batch([
        ctx.db
          .update(notificationsInNotification)
          .set({ deletedAt: new Date() })
          .where(
            and(
              ownedBy(notificationsInNotification, input, ctx.user.id),
              isNull(notificationsInNotification.deletedAt),
            ),
          )
          .returning(),
        selectUnreadNotificationCount(ctx.db, ctx.user.id),
      ]);
      const notification = requireMutation(deletedRows[0], Operation.Delete, DatabaseEntityType.Notification, input);
      return { notification, unreadCount: takeOne(unreadRows).count };
    }),
  // Every live row becomes a tombstone at once, so the bell's list empties on the answer
  deleteNotifications: standardAuthedProcedure.mutation<number>(async ({ ctx }) => {
    const [, unreadRows] = await ctx.db.batch([
      ctx.db
        .update(notificationsInNotification)
        .set({ deletedAt: new Date() })
        .where(and(eq(notificationsInNotification.userId, ctx.user.id), isNull(notificationsInNotification.deletedAt))),
      selectUnreadNotificationCount(ctx.db, ctx.user.id),
    ]);
    return takeOne(unreadRows).count;
  }),
  readNotifications: standardAuthedProcedure
    .input(readNotificationsInputSchema)
    .query<ReadNotificationsResult>(async ({ ctx, input: { cursor, limit } }) => {
      const userId = ctx.user.id;
      // The badge counts every unread row, not the ones a page happens to hold: unread notifications sit on pages the
      // Bell has never read, so the total is answered with the first page alone and the later pages leave it as it is
      const [rows, unreadRows] = await Promise.all([
        readNotificationRows(ctx.db, { cursor, limit, userId }),
        cursor.values.length === 0 ? selectUnreadNotificationCount(ctx.db, userId) : undefined,
      ]);
      const page = toPage(rows, NOTIFICATION_PAGE_SORT, cursor, limit);
      return unreadRows ? { ...page, unreadCount: takeOne(unreadRows).count } : page;
    }),
  updateNotificationsReadStatus: standardAuthedProcedure.mutation<number>(async ({ ctx }) => {
    const [, unreadRows] = await ctx.db.batch([
      ctx.db.update(notificationsInNotification).set({ isRead: true }).where(getUnreadNotificationsWhere(ctx.user.id)),
      selectUnreadNotificationCount(ctx.db, ctx.user.id),
    ]);
    return takeOne(unreadRows).count;
  }),
});
