import type { ReadNotificationsResult } from "#shared/models/db/notification/ReadNotificationsResult";
import type { Topic } from "@esposter/db-schema";
import type { User } from "better-auth";

import { ownedBy } from "#server/services/db/ownedBy";
import { getUnreadNotificationsWhere } from "#server/services/notification/getUnreadNotificationsWhere";
import { selectUnreadNotificationCount } from "#server/services/notification/selectUnreadNotificationCount";
import { router } from "#server/trpc";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { readNotificationsInputSchema } from "#shared/models/db/notification/ReadNotificationsInput";
import { NOTIFICATION_PAGE_SORT } from "#shared/services/notification/constants";
import { createPageSort, getPageOrderBy, getPageWhere, toPage } from "@esposter/db";
import {
  DatabaseEntityType,
  getTopic,
  notificationsInNotification,
  selectNotificationInNotificationSchema,
  TopicKind,
} from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// The notifications a user holds, and the unread count the bell shows of them, are one topic for the user
const notificationTopics = ({ ctx }: { ctx: { user: User } }): Topic[] => [
  getTopic(TopicKind.Notification, ctx.user.id),
];

export const notificationRouter = router({
  // Each write answers the unread count it leaves, read in the same batch, so the bell takes the settled value
  deleteNotification: getTopicsProcedure(
    standardAuthedProcedure.input(selectNotificationInNotificationSchema.shape.id),
    notificationTopics,
  ).mutation<number>(async ({ ctx, input }) => {
    const [deletedRows, unreadRows] = await ctx.db.batch([
      ctx.db
        .delete(notificationsInNotification)
        .where(ownedBy(notificationsInNotification, input, ctx.user.id))
        .returning(),
      selectUnreadNotificationCount(ctx.db, ctx.user.id),
    ]);
    requireMutation(deletedRows[0], Operation.Delete, DatabaseEntityType.Notification, input);
    return takeOne(unreadRows).count;
  }),
  deleteNotifications: getTopicsProcedure(standardAuthedProcedure, notificationTopics).mutation<number>(
    async ({ ctx }) => {
      const [, unreadRows] = await ctx.db.batch([
        ctx.db.delete(notificationsInNotification).where(eq(notificationsInNotification.userId, ctx.user.id)),
        selectUnreadNotificationCount(ctx.db, ctx.user.id),
      ]);
      return takeOne(unreadRows).count;
    },
  ),
  readNotifications: getTopicsProcedure(
    standardAuthedProcedure.input(readNotificationsInputSchema),
    notificationTopics,
  ).query<ReadNotificationsResult>(async ({ ctx, input: { cursor, limit } }) => {
    const userId = ctx.user.id;
    const boundSort = createPageSort({ id: notificationsInNotification.id }, NOTIFICATION_PAGE_SORT);
    // The badge counts every unread row, not the ones a page happens to hold: unread notifications sit on pages the
    // Bell has never read, so the total is answered with the first page alone and the later pages leave it as it is
    const [rows, unreadRows] = await Promise.all([
      ctx.db
        .select()
        .from(notificationsInNotification)
        .where(and(eq(notificationsInNotification.userId, userId), getPageWhere(boundSort, cursor)))
        .orderBy(...getPageOrderBy(boundSort, cursor))
        .limit(limit + 1),
      cursor.values.length === 0 ? selectUnreadNotificationCount(ctx.db, userId) : undefined,
    ]);
    const page = toPage(rows, NOTIFICATION_PAGE_SORT, cursor, limit);
    return unreadRows ? { ...page, unreadCount: takeOne(unreadRows).count } : page;
  }),
  updateNotificationsReadStatus: getTopicsProcedure(standardAuthedProcedure, notificationTopics).mutation<number>(
    async ({ ctx }) => {
      const [, unreadRows] = await ctx.db.batch([
        ctx.db
          .update(notificationsInNotification)
          .set({ isRead: true })
          .where(getUnreadNotificationsWhere(ctx.user.id)),
        selectUnreadNotificationCount(ctx.db, ctx.user.id),
      ]);
      return takeOne(unreadRows).count;
    },
  ),
});
