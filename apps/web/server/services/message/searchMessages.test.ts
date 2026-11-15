import type { RoomObjectRpc, RoomSearchHit } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { createRoomMessage } from "#server/services/message/createRoomMessage.test";
import { searchMessages } from "#server/services/message/searchMessages";
import { encodePageCursor, FilterType, FilterTypeHas, START_PAGE_CURSOR } from "@esposter/db-schema";
import { ZERO_UUID } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

// Each room's index is that room's object, so the object is faked and every room answers from the list a test sets
const { roomObject } = vi.hoisted(() => ({ roomObject: { searchMessages: vi.fn<RoomObjectRpc["searchMessages"]>() } }));
vi.mock(import("#server/composables/realtime/useRoomObject"), () => ({
  useRoomObject: vi.fn<typeof useRoomObject>(() => roomObject as unknown as ReturnType<typeof useRoomObject>),
}));

// The rooms are named in an order the tests rely on: the first room id sorts before the second
describe(searchMessages, () => {
  const roomId = ZERO_UUID;
  const otherRoomId = v7();
  const hasFile = { type: FilterType.Has, value: FilterTypeHas.File };
  const query = "gate";
  const createdAt = new Date(0);
  const later = new Date(Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
  const hit = (rank: null | number, id: number, time = createdAt): RoomSearchHit => ({
    ...createRoomMessage({ createdAt: time, id }),
    rank,
  });

  test("asks each room an in: filter names for the first page after the cursor, with the filters that are not in:", async () => {
    expect.hasAssertions();

    roomObject.searchMessages.mockResolvedValue({ count: 0, messages: [] });

    await searchMessages({
      cursor: START_PAGE_CURSOR,
      filters: [{ type: FilterType.In, value: otherRoomId }, hasFile],
      limit: 2,
      query,
      roomId,
    });

    expect(useRoomObject).toHaveBeenCalledExactlyOnceWith(otherRoomId);
    expect(roomObject.searchMessages).toHaveBeenCalledExactlyOnceWith({
      cursor: START_PAGE_CURSOR,
      filters: [hasFile],
      isCounted: true,
      limit: 3,
      query,
    });
  });

  // A score is not comparable across rooms, since each room's index counts its own terms, so the rooms take turns by
  // Rank position, and a rank both rooms share is ordered by the room
  test("interleaves the rooms' matches by rank, then by room, when there is text, and counts every room's matches", async () => {
    expect.hasAssertions();

    roomObject.searchMessages
      .mockResolvedValueOnce({ count: 5, messages: [hit(1, 1), hit(2, 2)] })
      .mockResolvedValueOnce({ count: 1, messages: [hit(1, 3)] });

    const { count, items } = await searchMessages({
      cursor: START_PAGE_CURSOR,
      filters: [
        { type: FilterType.In, value: roomId },
        { type: FilterType.In, value: otherRoomId },
      ],
      limit: 10,
      query,
      roomId,
    });

    expect(count).toBe(6);
    expect(items.map(({ id, roomId: hitRoomId }) => [id, hitRoomId])).toStrictEqual([
      [1, roomId],
      [3, otherRoomId],
      [2, roomId],
    ]);
  });

  // With no text the rooms merge by each message's own time, and where the times tie, by room and then by id
  test("merges the rooms' matches newest first, breaking a tie by room and then by id, and counts them on the first page only", async () => {
    expect.hasAssertions();

    roomObject.searchMessages
      .mockResolvedValueOnce({ count: 2, messages: [hit(null, 5, later), hit(null, 1)] })
      .mockResolvedValueOnce({ count: 1, messages: [hit(null, 3, later)] });

    const { count, items } = await searchMessages({
      cursor: START_PAGE_CURSOR,
      filters: [{ type: FilterType.In, value: roomId }, { type: FilterType.In, value: otherRoomId }, hasFile],
      limit: 2,
      query: "",
      roomId,
    });

    expect(count).toBe(3);
    expect(items.map(({ id }) => id)).toStrictEqual([3, 5]);
  });

  // The first page's cursor carries the rank and room of its last hit, and the next page's read hands it to every room
  test("continues the search from the rank, room and id of the last hit kept", async () => {
    expect.hasAssertions();

    roomObject.searchMessages.mockResolvedValueOnce({ count: 2, messages: [hit(1, 1), hit(2, 2)] });
    const firstPage = await searchMessages({ cursor: START_PAGE_CURSOR, filters: [], limit: 1, query, roomId });

    expect(firstPage.nextCursor).toBe(encodePageCursor({ isBackward: false, values: [1, roomId, 1] }));
    expect(firstPage.count).toBe(2);

    roomObject.searchMessages.mockResolvedValueOnce({ count: 0, messages: [hit(2, 2)] });
    const secondPage = await searchMessages({
      cursor: { isBackward: false, values: [1, roomId, 1] },
      filters: [],
      limit: 1,
      query,
      roomId,
    });

    expect(roomObject.searchMessages).toHaveBeenLastCalledWith({
      cursor: { isBackward: false, values: [1, roomId, 1] },
      filters: [],
      isCounted: false,
      limit: 2,
      query,
    });
    expect(secondPage).toStrictEqual({ items: [{ ...createRoomMessage({ id: 2 }), roomId }], nextCursor: "" });
  });
});
