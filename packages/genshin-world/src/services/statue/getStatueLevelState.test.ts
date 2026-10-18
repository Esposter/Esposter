import { getStatueLevelState } from "#src/services/statue/getStatueLevelState";
import { describe, expect, test } from "vitest";

describe(getStatueLevelState, () => {
  test("a level at or below the claimed level is claimed", () => {
    expect.hasAssertions();

    expect(getStatueLevelState(1, 3, 1)).toBe("claimed");
  });

  test("a level the region has reached and not yet claimed is claimable", () => {
    expect.hasAssertions();

    expect(getStatueLevelState(2, 3, 1)).toBe("claimable");
  });

  test("a level past the one the region has reached is locked", () => {
    expect.hasAssertions();

    expect(getStatueLevelState(4, 3, 1)).toBe("locked");
  });
});
