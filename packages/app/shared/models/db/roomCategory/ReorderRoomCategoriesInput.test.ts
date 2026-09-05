import { reorderRoomCategoriesInputSchema } from "#shared/models/db/roomCategory/ReorderRoomCategoriesInput";
import { MAX_READ_LIMIT } from "@esposter/shared";
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

  // An empty batch is a transaction that writes nothing, and the cap is the same one every batched write takes
  test.each([0, MAX_READ_LIMIT + 1])("rejects a batch of %s updates", (length) => {
    expect.hasAssertions();

    const updates = Array.from({ length }, (_element, index) => createUpdate(index));

    expect(reorderRoomCategoriesInputSchema.safeParse(updates).success).toBe(false);
  });
});
