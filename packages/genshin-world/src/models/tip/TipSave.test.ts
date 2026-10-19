import { tipSaveSchema } from "#src/models/tip/TipSave";
import { describe, expect, test } from "vitest";

describe("tipSaveSchema", () => {
  test("a save whose tips hold no queued list is refused, so it resets", () => {
    expect.hasAssertions();

    expect(tipSaveSchema.safeParse({ shown: [] }).success).toBe(false);
  });
});
