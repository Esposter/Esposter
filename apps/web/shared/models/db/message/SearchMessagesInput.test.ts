import { searchMessagesInputSchema } from "#shared/models/db/message/SearchMessagesInput";
import { encodePageCursor, FilterType, FilterTypeHas } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("searchMessagesInputSchema", () => {
  const roomId = v7();
  const query = "gate";
  const filter = { type: FilterType.Has, value: FilterTypeHas.File };

  // Nothing to search on at all is the one shape the endpoint refuses — an empty text query with no filter
  // Narrowing it would match the whole room
  test("rejects a search with neither text nor a filter", () => {
    expect.hasAssertions();

    expect(searchMessagesInputSchema.safeParse({ filters: [], query: "", roomId }).success).toBe(false);
    expect(searchMessagesInputSchema.safeParse({ filters: [], query: "a", roomId }).success).toBe(true);
    expect(searchMessagesInputSchema.safeParse({ filters: [filter], query: "", roomId }).success).toBe(true);
  });

  // Each filter is one condition the search ANDs in, so two of a type narrow together — rejecting the second would
  // Fail the whole search on a second `has:` chip
  test("accepts two filters of one type", () => {
    expect.hasAssertions();

    expect(
      searchMessagesInputSchema.safeParse({
        filters: [filter, { type: FilterType.Has, value: FilterTypeHas.Image }],
        query: "",
        roomId,
      }).success,
    ).toBe(true);
  });

  // A cursor holds one value per key of the order its search runs in, so one of another length is not a cursor this search
  // Issued, and a read that named an in: filter by a value other than a room id is not a search of rooms at all
  test("refuses a cursor that does not match the order of its search, and an in: filter that names no room", () => {
    expect.hasAssertions();

    expect(
      searchMessagesInputSchema.safeParse({
        cursor: encodePageCursor({ isBackward: false, values: [1] }),
        query,
        roomId,
      }).success,
    ).toBe(false);
    expect(
      searchMessagesInputSchema.safeParse({ filters: [{ type: FilterType.In, value: 1 }], query, roomId }).success,
    ).toBe(false);
  });
});
