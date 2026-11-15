import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createMockAuthSession, createMockCaller } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { bookmarkRouter } from "#server/trpc/routers/bookmark";
import { createRoomMember } from "#server/trpc/routers/createRoomMember.test";
import { trpcRouter } from "#server/trpc/routers/index";
import { resourceRouter } from "#server/trpc/routers/resource";
import { roomRouter } from "#server/trpc/routers/room/index";
import { setupResourceSuite } from "#server/trpc/routers/setupResourceSuite.test";
import { PageMarkType } from "#shared/models/app/PageMarkType";
import { bookmarksInApp, DatabaseEntityType, MAX_BOOKMARKS, ResourceType, roomsInMessage } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

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

  test("toggles a bookmark on and off", async () => {
    expect.hasAssertions();

    const isBookmarkedAfterFirstToggle = await caller.toggleBookmark({ path, title });
    const bookmarksAfterFirstToggle = await caller.readBookmarks();
    const isBookmarkedAfterSecondToggle = await caller.toggleBookmark({ path, title });
    const bookmarksAfterSecondToggle = await caller.readBookmarks();

    expect(isBookmarkedAfterFirstToggle).toBe(true);
    expect(bookmarksAfterFirstToggle).toStrictEqual([{ isAvailable: true, path, title }]);
    expect(isBookmarkedAfterSecondToggle).toBe(false);
    expect(bookmarksAfterSecondToggle).toStrictEqual([]);
  });

  test("stores a resource page's target and reads it back with its mark", async () => {
    expect.hasAssertions();

    const resource = await resourceCaller.createResource({ name, type: ResourceType.Blueprint });
    const mark = { id: resource.id, resourceType: ResourceType.Blueprint, type: PageMarkType.Resource };
    await caller.toggleBookmark({ mark, path, title });

    await expect(caller.readBookmarks()).resolves.toStrictEqual([{ isAvailable: true, mark, path, title }]);
  });

  test("hides a bookmarked resource while it is in the recycle bin, and reads it back once restored", async () => {
    expect.hasAssertions();

    const resource = await resourceCaller.createResource({ name, type: ResourceType.Blueprint });
    const mark = { id: resource.id, resourceType: ResourceType.Blueprint, type: PageMarkType.Resource };
    await caller.toggleBookmark({ mark, path, title });
    await resourceCaller.deleteResources({ ids: [resource.id] });
    const bookmarksWhileBinned = await caller.readBookmarks();
    await resourceCaller.restoreResources({ ids: [resource.id] });

    expect(bookmarksWhileBinned).toStrictEqual([]);
    await expect(caller.readBookmarks()).resolves.toStrictEqual([{ isAvailable: true, mark, path, title }]);
  });

  test("takes a purged resource's bookmark with it", async () => {
    expect.hasAssertions();

    const resource = await resourceCaller.createResource({ name, type: ResourceType.Blueprint });
    const mark = { id: resource.id, resourceType: ResourceType.Blueprint, type: PageMarkType.Resource };
    await caller.toggleBookmark({ mark, path, title });
    await resourceCaller.deleteResources({ ids: [resource.id] });
    await resourceCaller.purgeResource({ id: resource.id });

    await expect(caller.readBookmarks()).resolves.toStrictEqual([]);
  });

  test("reads a room bookmark back unavailable once the reader has left the room", async () => {
    expect.hasAssertions();

    const room = await createCallerFactory(roomRouter)(mockContext).createRoom({ name });
    const memberAuthSession = await createMockAuthSession(mockContext.db);
    await createRoomMember(mockContext, room.id, memberAuthSession.user);
    const memberCaller = await createMockCaller(bookmarkRouter, memberAuthSession);
    const mark = { id: room.id, type: PageMarkType.Room } as const;
    await memberCaller.toggleBookmark({ mark, path, title });
    const bookmarksWhileMember = await memberCaller.readBookmarks();
    const memberRoomCaller = await createMockCaller(roomRouter, memberAuthSession);
    await memberRoomCaller.leaveRoom(room.id);

    expect(bookmarksWhileMember).toStrictEqual([{ isAvailable: true, mark, path, title }]);
    await expect(memberCaller.readBookmarks()).resolves.toStrictEqual([{ isAvailable: false, path, title }]);
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
