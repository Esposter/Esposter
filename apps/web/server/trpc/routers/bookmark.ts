import type { Bookmark } from "@esposter/db-schema";

import { toggleBookmarkInputSchema } from "#shared/models/db/bookmark/ToggleBookmarkInput";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { bookmarks, DatabaseEntityType, MAX_BOOKMARKS } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

export const bookmarkRouter = router({
  readBookmarks: standardAuthedProcedure.query<Bookmark[]>(({ ctx }) =>
    ctx.db.query.bookmarks.findMany({
      orderBy: { createdAt: "asc" },
      where: { userId: { eq: ctx.getSessionPayload.user.id } },
    }),
  ),
  toggleBookmark: standardAuthedProcedure.input(toggleBookmarkInputSchema).mutation<boolean>(async ({ ctx, input }) => {
    const userId = ctx.getSessionPayload.user.id;
    // Delete-then-insert rather than a read-then-branch: the delete's own returning() reports whether the page
    // Was bookmarked, so the toggle can never race with itself
    const deletedBookmarks = await ctx.db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.path, input.path)))
      .returning();
    if (deletedBookmarks.length > 0) return false;

    if ((await ctx.db.$count(bookmarks, eq(bookmarks.userId, userId))) >= MAX_BOOKMARKS)
      throw getInvalidOperationError(Operation.Create, DatabaseEntityType.Bookmark, input.path);

    await ctx.db
      .insert(bookmarks)
      .values({ ...input, userId })
      .onConflictDoNothing();
    return true;
  }),
});
