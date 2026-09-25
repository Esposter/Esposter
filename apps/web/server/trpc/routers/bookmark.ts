import type { PageLink } from "#shared/models/app/PageLink";

import { PageMarkType } from "#shared/models/app/PageMarkType";
import { toggleBookmarkInputSchema } from "#shared/models/db/bookmark/ToggleBookmarkInput";
import { router } from "@@/server/trpc";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { bookmarks, DatabaseEntityType, MAX_BOOKMARKS } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

export const bookmarkRouter = router({
  readBookmarks: standardAuthedProcedure.query<PageLink[]>(async ({ ctx }) => {
    const userBookmarks = await ctx.db.query.bookmarks.findMany({
      orderBy: { createdAt: "asc" },
      where: { userId: { eq: ctx.getSessionPayload.user.id } },
    });
    // A bookmark of a resource's page carries its type as the place's mark; any other page has none
    return userBookmarks.map(({ path, resourceType, title }): PageLink =>
      resourceType ? { mark: { resourceType, type: PageMarkType.Resource }, path, title } : { path, title },
    );
  }),
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
      .values({ path: input.path, resourceType: input.mark?.resourceType, title: input.title, userId })
      .onConflictDoNothing();
    return true;
  }),
});
