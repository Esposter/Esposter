import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { describe, expect, test } from "vitest";

describe(requireEntity, () => {
  test("resolves with entity when query returns a value", async () => {
    expect.hasAssertions();

    const entity = { id: "" };
    const result = await requireEntity(Promise.resolve(entity), "Entity", "");

    expect(result).toBe(entity);
  });

  test("throws TRPCError with code NOT_FOUND when query returns undefined", async () => {
    expect.hasAssertions();

    await expect(requireEntity(Promise.resolve(undefined), "Entity", "1")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Entity "1" not found]`,
    );
  });
});
