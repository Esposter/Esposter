import { readDuplicateProseFindings } from "#src/services/sweeps/duplicateProse/readDuplicateProseFindings";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { describe, expect, test } from "vitest";

/**
 * One owner per topic (`skill-authoring`, `docs`): a rule lives in one skill or page, and every other page
 * points at it rather than restating it. A run of ten prose words two pages of different owners share is what a
 * restatement leaves behind — a pointer never shares one — so the tree holds none. Which of the two pages owns
 * the run is the judgement the `ai:sweep:duplicate-prose` pass makes; that there is one to make is decided here.
 */
describe("duplicateProse", () => {
  test("no two pages of different owners share a run of prose", { timeout: TREE_READ_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    expect(
      readDuplicateProseFindings().map(({ paths, words }) => `${paths[0]} | ${paths[1]}: ${words.join(" ")}`),
    ).toStrictEqual([]);
  });
});
