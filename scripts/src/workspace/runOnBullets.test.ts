import { readRunOnBulletFindings } from "#src/services/sweeps/runOnBullets/readRunOnBulletFindings";
import { describe, expect, test } from "vitest";

/**
 * A bullet that an edit joined onto the end of the bullet before it renders as that bullet's text, its bold lead lost
 * in the paragraph. Nothing else fails on it: the page's links, diagrams and citations all still resolve, and the
 * specs' bullets have run together twice before any reader noticed.
 */
describe("runOnBullets", () => {
  test("no markdown page opens a bullet on the line of the sentence before it", () => {
    expect.hasAssertions();

    expect(readRunOnBulletFindings()).toStrictEqual([]);
  });
});
