import { computeSpawnLevel } from "#src/services/adventureRank/computeSpawnLevel";
import { describe, expect, test } from "vitest";

describe(computeSpawnLevel, () => {
  test("a camp's enemy stands at its own level at World Level 0", () => {
    expect.hasAssertions();

    expect(computeSpawnLevel(2, 0)).toBe(2);
  });

  test("a camp's enemy is raised from World Level 1 by the World Level's monster level", () => {
    expect.hasAssertions();

    expect(computeSpawnLevel(2, 1)).toBe(10);
    expect(computeSpawnLevel(2, 9)).toBe(84);
  });
});
