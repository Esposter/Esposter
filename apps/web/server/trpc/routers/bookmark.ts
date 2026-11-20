import type { ReadBookmark } from "#shared/models/db/bookmark/ReadBookmark";
import type { BookmarkInApp } from "@esposter/db-schema";

import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { getPublicationWhere } from "#server/services/resource/getPublicationWhere";
import { requireMutation } from "#server/trpc/guards/requireMutation";
import { router } from "#server/trpc/index";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { PageMarkType } from "#shared/models/app/PageMarkType";
import { toggleBookmarkInputSchema } from "#shared/models/db/bookmark/ToggleBookmarkInput";
import { getBookmarkTarget } from "#shared/services/bookmark/getBookmarkTarget";
import {
  bookmarksInApp,
  DatabaseEntityType,
  getLiveMembershipWhere,
  MAX_BOOKMARKS,
  resourcesInResource,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, asc, eq, getTableColumns, isNotNull, isNull, sql } from "drizzle-orm";

export const bookmarkRouter = router({
  // Every bookmark the reader holds, a removed one included as its tombstone, with the fields the read joins in from the
  // Targets: whether the page is reachable, and the mark that names it. A resource in the recycle bin is unreachable until it
  // Is restored, and its bookmark is still answered, so it is drawn unavailable rather than left out
  readBookmarks: standardAuthedProcedure.query<ReadBookmark[]>(async ({ ctx }) => {
    const userId = ctx.user.id;
    const userBookmarks = await ctx.db
      .select({
        ...getTableColumns(bookmarksInApp),
        isPublished: sql<boolean>`${getPublicationWhere(ctx.db, bookmarksInApp.resourceId, true)}`.mapWith(Boolean),
        resourceDeletedAt: resourcesInResource.deletedAt,
        resourceOwnerId: resourcesInResource.userId,
        resourceType: resourcesInResource.type,
        roomMemberId: usersToRoomsInMessage.roomId,
      })
      .from(bookmarksInApp)
      .leftJoin(resourcesInResource, eq(resourcesInResource.id, bookmarksInApp.resourceId))
      .leftJoin(
        usersToRoomsInMessage,
        and(
          eq(usersToRoomsInMessage.roomId, bookmarksInApp.roomId),
          eq(usersToRoomsInMessage.userId, userId),
          getLiveMembershipWhere(usersToRoomsInMessage),
        ),
      )
      .where(eq(bookmarksInApp.userId, userId))
      .orderBy(asc(bookmarksInApp.createdAt));
    // A resource is reached by its owner or once published, and a room by its members. A target the reader cannot reach
    // Carries no mark, so the type of a resource they cannot read is not sent to them
    return userBookmarks.map(
      ({ isPublished, resourceDeletedAt, resourceOwnerId, resourceType, roomMemberId, ...bookmark }): ReadBookmark => {
        if (bookmark.resourceId !== null) {
          const isAvailable = resourceDeletedAt === null && (resourceOwnerId === userId || isPublished);
          return isAvailable && resourceType !== null
            ? { ...bookmark, isAvailable, mark: { id: bookmark.resourceId, resourceType, type: PageMarkType.Resource } }
            : { ...bookmark, isAvailable };
        }
        if (bookmark.roomId !== null) {
          const isAvailable = roomMemberId !== null;
          return isAvailable
            ? { ...bookmark, isAvailable, mark: { id: bookmark.roomId, type: PageMarkType.Room } }
            : { ...bookmark, isAvailable };
        }
        return { ...bookmark, isAvailable: true };
      },
    );
  }),
  // Answers the row as it now stands: a live one when the page is bookmarked, its tombstone when the removal just left it
  toggleBookmark: standardAuthedProcedure
    .input(toggleBookmarkInputSchema)
    .mutation<BookmarkInApp>(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // A removal leaves the row as a tombstone, so its version rises and a read that lands later loses to it. Only a page
      // That is not bookmarked live falls through to the insert
      const [removedBookmark] = await ctx.db
        .update(bookmarksInApp)
        .set({ deletedAt: new Date() })
        .where(
          and(eq(bookmarksInApp.userId, userId), eq(bookmarksInApp.path, input.path), isNull(bookmarksInApp.deletedAt)),
        )
        .returning();
      if (removedBookmark) return removedBookmark;

      // The cap counts the live rows, so a tombstone revived under it is one more. The insert is only selected while the
      // User is under the cap, and it revives this page's tombstone rather than conflicting with it. The batch reads the live
      // Row back, which tells a page another device just bookmarked (kept) from a full list (refused), with no read ahead of the write
      const target = getBookmarkTarget(input.mark);
      const [, bookmarkRows] = await ctx.db.batch([
        ctx.db
          .insert(bookmarksInApp)
          .select(
            ctx.db
              .select({
                ...getInsertSelectMetadata(bookmarksInApp),
                path: sql`${input.path}`.as("path"),
                resourceId: sql`${target.resourceId}`.as("resourceId"),
                roomId: sql`${target.roomId}`.as("roomId"),
                title: sql`${input.title}`.as("title"),
                userId: sql`${userId}`.as("userId"),
              })
              .from(usersInAuth)
              .where(
                and(
                  eq(usersInAuth.id, userId),
                  sql`(select count(*) from ${bookmarksInApp} where ${and(eq(bookmarksInApp.userId, userId), isNull(bookmarksInApp.deletedAt))}) < ${MAX_BOOKMARKS}`,
                ),
              ),
          )
          .onConflictDoUpdate({
            set: { deletedAt: null, resourceId: target.resourceId, roomId: target.roomId, title: input.title },
            setWhere: isNotNull(bookmarksInApp.deletedAt),
            target: [bookmarksInApp.userId, bookmarksInApp.path],
          }),
        ctx.db
          .select()
          .from(bookmarksInApp)
          .where(
            and(
              eq(bookmarksInApp.userId, userId),
              eq(bookmarksInApp.path, input.path),
              isNull(bookmarksInApp.deletedAt),
            ),
          ),
      ]);
      return requireMutation(bookmarkRows[0], Operation.Create, DatabaseEntityType.Bookmark, input.path);
    }),
});
