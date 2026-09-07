import { searchMessagesInputSchema } from "#shared/models/db/message/SearchMessagesInput";
import { FilterType, FilterTypeHas } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe("searchMessagesInputSchema", () => {
  const roomId = crypto.randomUUID();
  const filter = { type: FilterType.Has, value: FilterTypeHas.File };

  // Nothing to search on at all is the one shape the endpoint refuses — an empty text query with no filter
  // Narrowing it would match the whole room
  test("rejects a search with neither text nor a filter", () => {
    expect.hasAssertions();

    expect(searchMessagesInputSchema.safeParse({ filters: [], query: "", roomId }).success).toBe(false);
    expect(searchMessagesInputSchema.safeParse({ filters: [], query: "a", roomId }).success).toBe(true);
    expect(searchMessagesInputSchema.safeParse({ filters: [filter], query: "", roomId }).success).toBe(true);
  });

  // Azure Search takes one clause per filter, so two of a type narrow together — rejecting the second would
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
});
