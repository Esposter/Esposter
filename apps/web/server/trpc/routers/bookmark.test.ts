import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { PageMarkType } from "#shared/models/app/PageMarkType";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { bookmarkRouter } from "@@/server/trpc/routers/bookmark";
import { bookmarks, DatabaseEntityType, MAX_BOOKMARKS, ResourceType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("bookmarkRouter", () => {
  const path = "/path";
  const title = "title";
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["bookmark"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(bookmarkRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(bookmarks);
  });

  test("toggles a bookmark on and off", async () => {
    expect.hasAssertions();

    const isBookmarkedAfterFirstToggle = await caller.toggleBookmark({ path, title });
    const bookmarksAfterFirstToggle = await caller.readBookmarks();
    const isBookmarkedAfterSecondToggle = await caller.toggleBookmark({ path, title });
    const bookmarksAfterSecondToggle = await caller.readBookmarks();

    expect(isBookmarkedAfterFirstToggle).toBe(true);
    expect(bookmarksAfterFirstToggle).toStrictEqual([{ path, title }]);
    expect(isBookmarkedAfterSecondToggle).toBe(false);
    expect(bookmarksAfterSecondToggle).toStrictEqual([]);
  });

  test("reads a bookmark back with the mark it was saved with", async () => {
    expect.hasAssertions();

    const mark = { resourceType: ResourceType.Blueprint, type: PageMarkType.Resource };
    await caller.toggleBookmark({ mark, path, title });

    await expect(caller.readBookmarks()).resolves.toStrictEqual([{ mark, path, title }]);
  });

  test("fails to bookmark past the limit", async () => {
    expect.hasAssertions();

    await Promise.all(
      Array.from({ length: MAX_BOOKMARKS }, (_, index) => caller.toggleBookmark({ path: `${path}${index}`, title })),
    );

    await expect(caller.toggleBookmark({ path, title })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Bookmark, path).message}]`,
    );
  });
});
