import { reorderRoomCategoriesInputSchema } from "#shared/models/db/roomCategory/ReorderRoomCategoriesInput";
import { describe, expect, test } from "vitest";

const createUpdate = (position: number) => ({ id: crypto.randomUUID(), position });

describe("reorderRoomCategoriesInputSchema", () => {
  test("parses the position updates one drag produces", () => {
    expect.hasAssertions();

    const updates = [createUpdate(0), createUpdate(1)];

    expect(reorderRoomCategoriesInputSchema.parse(updates)).toStrictEqual(updates);
  });

  // Two entries for one category issue two writes inside the reorder transaction, and which one survives is
  // Decided by the order they happen to arrive in rather than by anything the caller asked for
  test("rejects two updates for the same category", () => {
    expect.hasAssertions();

    const update = createUpdate(0);

    expect(reorderRoomCategoriesInputSchema.safeParse([update, { ...update, position: 1 }]).success).toBe(false);
  });
});
