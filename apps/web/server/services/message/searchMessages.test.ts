import type { RoomObjectRpc } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { createRoomMessage } from "#server/services/message/createRoomMessage.test";
import { searchMessages } from "#server/services/message/searchMessages";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { FilterType, FilterTypeHas } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

// Each room's index is that room's object, so the object is faked and every room answers from the list a test sets
const { roomObject } = vi.hoisted(() => ({ roomObject: { searchMessages: vi.fn<RoomObjectRpc["searchMessages"]>() } }));
vi.mock(import("#server/composables/realtime/useRoomObject"), () => ({
  useRoomObject: vi.fn<typeof useRoomObject>(() => roomObject as unknown as ReturnType<typeof useRoomObject>),
}));

describe(searchMessages, () => {
  const roomId = v7();
  const otherRoomId = v7();
  const hasFile = { type: FilterType.Has, value: FilterTypeHas.File };
  const query = "gate";
  const sortBy = [CREATED_AT_DESCENDING_SORT_ITEM];

  test("asks each room an in: filter names for the first offset, limit and one more, with the filters that are not in:", async () => {
    expect.hasAssertions();

    roomObject.searchMessages.mockResolvedValue({ count: 0, messages: [] });

    await searchMessages({
      filters: [{ type: FilterType.In, value: otherRoomId }, hasFile],
      limit: 2,
      offset: 1,
      query,
      roomId,
      sortBy,
    });

    expect(useRoomObject).toHaveBeenCalledExactlyOnceWith(otherRoomId);
    expect(roomObject.searchMessages).toHaveBeenCalledExactlyOnceWith({
      filters: [hasFile],
      limit: 4,
      offset: 0,
      query,
    });
  });

  // A score is not comparable across rooms, since each room's index counts its own terms, so the rooms take turns by
  // Rank position. The rooms are asked in the order the filters name them, which is the order their answers are read
  test("interleaves the rooms' matches by rank position when there is text, and counts each room's own matches", async () => {
    expect.hasAssertions();

    const firstRoomMessages = [createRoomMessage({ id: 1 }), createRoomMessage({ id: 2 })];
    const secondRoomMessages = [createRoomMessage({ id: 3 })];
    roomObject.searchMessages
      .mockResolvedValueOnce({ count: 5, messages: firstRoomMessages })
      .mockResolvedValueOnce({ count: 1, messages: secondRoomMessages });

    const { count, data } = await searchMessages({
      filters: [
        { type: FilterType.In, value: roomId },
        { type: FilterType.In, value: otherRoomId },
      ],
      limit: 10,
      offset: 0,
      query,
      roomId,
      sortBy,
    });

    expect(count).toBe(6);
    expect(data.items.map(({ id }) => id)).toStrictEqual([1, 3, 2]);
  });

  // Without text the rooms' lists merge by each message's own time, and by id where the times tie. The offset then
  // Pages the merged list, so an id that breaks a tie decides which message the second page starts on
  test("merges the rooms' matches newest first, breaking a tie by id, and pages the merged list", async () => {
    expect.hasAssertions();

    const durationMs = 1;
    const earlier = new Date(0);
    const later = new Date(Temporal.Instant.fromEpochMilliseconds(durationMs).epochMilliseconds);
    roomObject.searchMessages
      .mockResolvedValueOnce({
        count: 2,
        messages: [createRoomMessage({ createdAt: later, id: 5 }), createRoomMessage({ createdAt: earlier, id: 1 })],
      })
      .mockResolvedValueOnce({ count: 1, messages: [createRoomMessage({ createdAt: later, id: 3 })] });

    const { data } = await searchMessages({
      filters: [{ type: FilterType.In, value: roomId }, { type: FilterType.In, value: otherRoomId }, hasFile],
      limit: 1,
      offset: 1,
      query: "",
      roomId,
      sortBy,
    });

    expect(data.hasMore).toBe(true);
    expect(data.items.map(({ id }) => id)).toStrictEqual([3]);
  });
});
