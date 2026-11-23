import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { BookmarkPageLink } from "#shared/models/app/BookmarkPageLink";
import type { ReadBookmark } from "#shared/models/db/bookmark/ReadBookmark";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockAuthSession, createMockCaller, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { getUncoveredWrites } from "#server/trpc/optimisticWriteCrossCheck.test";
import { bookmarkRouter } from "#server/trpc/routers/bookmark";
import { createRoomMember } from "#server/trpc/routers/createRoomMember.test";
import { trpcRouter } from "#server/trpc/routers/index";
import { resourceRouter } from "#server/trpc/routers/resource";
import { roomRouter } from "#server/trpc/routers/room/index";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { PageMarkType } from "#shared/models/app/PageMarkType";
import { bookmarkTable } from "#src/services/bookmark/overlay/constants";
import { getToggleBookmarkEntry } from "#src/services/bookmark/overlay/getToggleBookmarkEntry";
import { bookmarksInApp, DatabaseEntityType, MAX_BOOKMARKS, ResourceType, roomsInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// A read's row as the dock draws it: the link's own fields, with the mark only where the read joined one
const toLink = ({ isAvailable, mark, path, title }: ReadBookmark): BookmarkPageLink =>
  mark ? { isAvailable, mark, path, title } : { isAvailable, path, title };

describe("bookmarkRouter", () => {
  const { getMockContext } = setupResourceSuite(resourceRouter);
  const path = "/path";
  const title = "title";
  const name = "name";
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["bookmark"]>;
  let resourceCaller: DecorateRouterRecord<TRPCRouter["resource"]>;

  beforeAll(() => {
    mockContext = getMockContext();
    caller = createCallerFactory(bookmarkRouter)(mockContext);
    resourceCaller = createCallerFactory(trpcRouter)(mockContext).resource;
  });

  afterEach(async () => {
    await mockContext.db.delete(bookmarksInApp);
    await mockContext.db.delete(roomsInMessage);
  });

  // A read's live rows as the dock draws them
  const readLinks = async (bookmarkCaller: DecorateRouterRecord<TRPCRouter["bookmark"]> = caller) =>
    (await bookmarkCaller.readBookmarks())
      .filter(({ deletedAt }) => deletedAt === null)
      .map((bookmark) => toLink(bookmark));

  // A resource bookmarked from its own page, with the mark that names it
  const bookmarkResource = async () => {
    const resource = await resourceCaller.createResource({ name, type: ResourceType.Blueprint });
    const mark = { id: resource.id, resourceType: ResourceType.Blueprint, type: PageMarkType.Resource };
    await caller.toggleBookmark({ mark, path, title });
    return { mark, resource };
  };

  // The toggle's entry is the one the store issues, and the bookmark row the toggle names is the one it shows
  test("the toggle entry covers the bookmark row the toggle names", async () => {
    expect.hasAssertions();

    const { named, uncovered } = await getUncoveredWrites({
      call: (context) => createCallerFactory(bookmarkRouter)(context).toggleBookmark({ path, title }),
      context: mockContext,
      entry: getToggleBookmarkEntry(getMockSession().user.id, { path, title }, new Date(0)),
      path: "toggleBookmark",
      tables: [bookmarkTable],
    });

    expect(named).toHaveLength(1);
    expect(uncovered).toStrictEqual([]);
  });

  test("toggles a bookmark on and off", async () => {
    expect.hasAssertions();

    const bookmarkAfterFirstToggle = await caller.toggleBookmark({ path, title });
    const linksAfterFirstToggle = await readLinks();
    const bookmarkAfterSecondToggle = await caller.toggleBookmark({ path, title });
    const linksAfterSecondToggle = await readLinks();

    expect(bookmarkAfterFirstToggle.deletedAt).toBeNull();
    expect(linksAfterFirstToggle).toStrictEqual([{ isAvailable: true, path, title }]);
    expect(bookmarkAfterSecondToggle.deletedAt).not.toBeNull();
    expect(linksAfterSecondToggle).toStrictEqual([]);
  });

  test("stores a resource page's target and reads it back with its mark", async () => {
    expect.hasAssertions();

    const { mark } = await bookmarkResource();

    await expect(readLinks()).resolves.toStrictEqual([{ isAvailable: true, mark, path, title }]);
  });

  test("reads a bookmarked resource back unavailable while it is in the recycle bin, and available once restored", async () => {
    expect.hasAssertions();

    const { mark, resource } = await bookmarkResource();
    await resourceCaller.deleteResources({ ids: [resource.id] });
    const linksWhileBinned = await readLinks();
    await resourceCaller.restoreResources({ ids: [resource.id] });

    expect(linksWhileBinned).toStrictEqual([{ isAvailable: false, path, title }]);
    await expect(readLinks()).resolves.toStrictEqual([{ isAvailable: true, mark, path, title }]);
  });

  test("takes a purged resource's bookmark with it", async () => {
    expect.hasAssertions();

    const { resource } = await bookmarkResource();
    await resourceCaller.deleteResources({ ids: [resource.id] });
    await resourceCaller.purgeResource({ id: resource.id });

    await expect(readLinks()).resolves.toStrictEqual([]);
  });

  test("reads a room bookmark back unavailable once the reader has left the room", async () => {
    expect.hasAssertions();

    const room = await createCallerFactory(roomRouter)(mockContext).createRoom({ name });
    const memberAuthSession = await createMockAuthSession(mockContext.db);
    await createRoomMember(mockContext, room.id, memberAuthSession.user);
    const memberCaller = await createMockCaller(bookmarkRouter, memberAuthSession);
    const mark = { id: room.id, type: PageMarkType.Room } as const;
    await memberCaller.toggleBookmark({ mark, path, title });
    const linksWhileMember = await readLinks(memberCaller);
    const memberRoomCaller = await createMockCaller(roomRouter, memberAuthSession);
    await memberRoomCaller.leaveRoom(room.id);

    expect(linksWhileMember).toStrictEqual([{ isAvailable: true, mark, path, title }]);
    await expect(readLinks(memberCaller)).resolves.toStrictEqual([{ isAvailable: false, path, title }]);
  });

  // A removal leaves the row as a tombstone the read returns, so a read that lands later cannot restore the bookmark,
  // And a Bookmark made again revives that row at a higher version
  test("keeps a removed bookmark as a tombstone the read returns, and revives it at a higher version", async () => {
    expect.hasAssertions();

    await caller.toggleBookmark({ path, title });
    const removedBookmark = await caller.toggleBookmark({ path, title });
    const tombstones = await caller.readBookmarks();
    const revivedBookmark = await caller.toggleBookmark({ path, title });

    expect(removedBookmark.deletedAt).not.toBeNull();
    expect(
      tombstones.map(({ deletedAt, path: bookmarkPath }) => ({ bookmarkPath, isRemoved: deletedAt instanceof Date })),
    ).toStrictEqual([{ bookmarkPath: path, isRemoved: true }]);
    expect(revivedBookmark.deletedAt).toBeNull();
    expect(revivedBookmark.version).toBeGreaterThan(removedBookmark.version);
  });

  test("fails to bookmark past the limit", async () => {
    expect.hasAssertions();

    await Promise.all(
      Array.from({ length: MAX_BOOKMARKS }, (_value, index) =>
        caller.toggleBookmark({ path: `${path}${index}`, title }),
      ),
    );

    await expect(caller.toggleBookmark({ path, title })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new InvalidOperationError(Operation.Create, DatabaseEntityType.Bookmark, path).message}]`,
    );
  });
});
