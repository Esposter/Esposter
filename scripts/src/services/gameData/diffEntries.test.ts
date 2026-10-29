import { diffEntries } from "#src/services/gameData/diffEntries";
import { describe, expect, test } from "vitest";

describe(diffEntries, () => {
  test("counts a name only one side holds, even one named as an inherited member", () => {
    expect.hasAssertions();

    const diff = diffEntries({}, { constructor: "a".repeat(64) });

    expect(diff).toStrictEqual({ addedCount: 1, changes: [], removedCount: 0 });
  });
});
