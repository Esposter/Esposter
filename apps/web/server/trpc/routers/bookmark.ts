import type { BookmarkPageLink } from "#shared/models/app/BookmarkPageLink";

import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { getPublicationWhere } from "#server/services/resource/getPublicationWhere";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { router } from "#server/trpc/index";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { PageMarkType } from "#shared/models/app/PageMarkType";
import { toggleBookmarkInputSchema } from "#shared/models/db/bookmark/ToggleBookmarkInput";
import {
  bookmarksInApp,
  DatabaseEntityType,
  getTopic,
  MAX_BOOKMARKS,
  resourcesInResource,
  TopicKind,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, asc, eq, isNull, or, sql } from "drizzle-orm";

export const bookmarkRouter = router({
  readBookmarks: getTopicsProcedure(standardAuthedProcedure, ({ ctx }) => [
    getTopic(TopicKind.Bookmark, ctx.user.id),
  ]).query<BookmarkPageLink[]>(async ({ ctx }) => {
    const userId = ctx.user.id;
    // One query over every target: a resource's owner and publication, and a room's membership, each left-joined so
    // A bookmark with no target answers nulls. A resource in the recycle bin is left out, and comes back with its restore
    const userBookmarks = await ctx.db
      .select({
        isPublished: sql<boolean>`${getPublicationWhere(ctx.db, bookmarksInApp.resourceId, true)}`.mapWith(Boolean),
        path: bookmarksInApp.path,
        resourceId: bookmarksInApp.resourceId,
        resourceOwnerId: resourcesInResource.userId,
        resourceType: resourcesInResource.type,
        roomId: bookmarksInApp.roomId,
        roomMemberId: usersToRoomsInMessage.roomId,
        title: bookmarksInApp.title,
      })
      .from(bookmarksInApp)
      .leftJoin(resourcesInResource, eq(resourcesInResource.id, bookmarksInApp.resourceId))
      .leftJoin(
        usersToRoomsInMessage,
        and(eq(usersToRoomsInMessage.roomId, bookmarksInApp.roomId), eq(usersToRoomsInMessage.userId, userId)),
      )
      .where(
        and(
          eq(bookmarksInApp.userId, userId),
          or(isNull(bookmarksInApp.resourceId), isNull(resourcesInResource.deletedAt)),
        ),
      )
      .orderBy(asc(bookmarksInApp.createdAt));
    // A resource is reached by its owner or once published, and a room by its members. A target the reader cannot reach
    // Carries no mark, so the type of a resource they cannot read is not sent to them
    return userBookmarks.map(
      ({
        isPublished,
        path,
        resourceId,
        resourceOwnerId,
        resourceType,
        roomId,
        roomMemberId,
        title,
      }): BookmarkPageLink => {
        if (resourceId !== null) {
          const isAvailable = resourceOwnerId === userId || isPublished;
          return isAvailable && resourceType !== null
            ? { isAvailable, mark: { id: resourceId, resourceType, type: PageMarkType.Resource }, path, title }
            : { isAvailable, path, title };
        }
        if (roomId !== null) {
          const isAvailable = roomMemberId !== null;
          return isAvailable
            ? { isAvailable, mark: { id: roomId, type: PageMarkType.Room }, path, title }
            : { isAvailable, path, title };
        }
        return { isAvailable: true, path, title };
      },
    );
  }),
  toggleBookmark: getTopicsProcedure(standardAuthedProcedure.input(toggleBookmarkInputSchema), ({ ctx }) => [
    getTopic(TopicKind.Bookmark, ctx.user.id),
  ]).mutation<boolean>(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    // Delete-then-insert rather than a read-then-branch: the delete's own returning() reports whether the page
    // Was bookmarked, so the toggle can never race with itself
    const deletedBookmarks = await ctx.db
      .delete(bookmarksInApp)
      .where(and(eq(bookmarksInApp.userId, userId), eq(bookmarksInApp.path, input.path)))
      .returning();
    if (deletedBookmarks.length > 0) return false;

    // The page's target is the one id its mark names, held by the column its kind names, and the other stays null
    const resourceId = input.mark?.type === PageMarkType.Resource ? input.mark.id : null;
    const roomId = input.mark?.type === PageMarkType.Room ? input.mark.id : null;
    // The cap is a count, so the insert carries it: the row is only selected while the user is under the cap, and
    // The batch reads the page back after the insert, which tells a page another device just bookmarked (kept) from
    // A full list (refused) without a read ahead of the write
    const [, existingBookmarks] = await ctx.db.batch([
      ctx.db
        .insert(bookmarksInApp)
        .select(
          ctx.db
            .select({
              ...getInsertSelectMetadata(bookmarksInApp),
              path: sql`${input.path}`.as("path"),
              resourceId: sql`${resourceId}`.as("resourceId"),
              roomId: sql`${roomId}`.as("roomId"),
              title: sql`${input.title}`.as("title"),
              userId: sql`${userId}`.as("userId"),
            })
            .from(usersInAuth)
            .where(
              and(
                eq(usersInAuth.id, userId),
                sql`(select count(*) from ${bookmarksInApp} where ${eq(bookmarksInApp.userId, userId)}) < ${MAX_BOOKMARKS}`,
              ),
            ),
        )
        .onConflictDoNothing(),
      ctx.db
        .select({ path: bookmarksInApp.path })
        .from(bookmarksInApp)
        .where(and(eq(bookmarksInApp.userId, userId), eq(bookmarksInApp.path, input.path))),
    ]);
    if (existingBookmarks.length > 0) return true;
    throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Bookmark, input.path);
  }),
});
