import { getCascadeTombstones } from "#server/services/tombstone/getCascadeTombstones";
import { getMockSession } from "#server/trpc/context.test";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import {
  bookmarksInApp,
  getLiveRowWhere,
  OVERLAY_TOMBSTONE_TABLES,
  roomFiltersInMessage,
  roomsInMessage,
} from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { describe, expect, test } from "vitest";

describe(getCascadeTombstones, () => {
  const { getMockContext, getRoomId } = setupRoomSuite();

  // The registry does not name a room's filter, so the suite names it as one more entry, and the cascade reaches it
  // Through its foreign key alone
  test("tombstones a room child the registry adds, from its foreign key alone", async () => {
    expect.hasAssertions();

    const db = getMockContext().db;
    const roomId = getRoomId();
    await db.insert(roomFiltersInMessage).values({ roomId });
    const readLiveFilters = () =>
      db.query.roomFiltersInMessage.findMany({ where: { RAW: getLiveRowWhere, roomId: { eq: roomId } } });
    await expect(readLiveFilters()).resolves.toHaveLength(1);

    await Promise.all(
      getCascadeTombstones(
        db,
        roomsInMessage,
        eq(roomsInMessage.id, roomId),
        [],
        [...OVERLAY_TOMBSTONE_TABLES, roomFiltersInMessage],
      ),
    );

    await expect(readLiveFilters()).resolves.toStrictEqual([]);
  });

  test("leaves a bookmark of the room live, since the purge's cascade removes it with the room", async () => {
    expect.hasAssertions();

    const db = getMockContext().db;
    const roomId = getRoomId();
    await db
      .insert(bookmarksInApp)
      .values({ path: `/rooms/${roomId}`, roomId, title: "title", userId: getMockSession().user.id });

    await Promise.all(getCascadeTombstones(db, roomsInMessage, eq(roomsInMessage.id, roomId)));

    await expect(
      db.select({ deletedAt: bookmarksInApp.deletedAt }).from(bookmarksInApp).where(eq(bookmarksInApp.roomId, roomId)),
    ).resolves.toStrictEqual([{ deletedAt: null }]);
  });
});
