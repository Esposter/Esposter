import { GENSHIN_ROADMAP_FILE } from "#src/services/genshinProgress/constants";
import { readRoadmapPhaseHeading } from "#src/services/genshinProgress/readRoadmapPhaseHeading";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The roadmap is grouped by the phase each open item holds, so an open item under no phase heading is one no phase's
// Gate counts and no progress report can place. A ticked item is a record of a finished one and needs no phase
describe("roadmapPhases", () => {
  const ROADMAP_PATH = join(REPOSITORY_ROOT, GENSHIN_ROADMAP_FILE);
  const HEADING_REGEX = /^#{1,2} /u;
  const OPEN_ITEM_REGEX = /^\s*- \[ \] /u;
  const ASSET_LINE_REGEX = /^\s*Asset: /u;
  // The pictures a screen draws as a stand-in, each named by the words its roadmap line gives it
  const STAND_IN_PICTURES = [
    "duel board frame ornament",
    "duel board icons and coins",
    "Gcg plate portraits",
    "Forge recipe item icons",
    "Forge support portrait",
    "quest series-row picture",
    "expedition pin and book emblem",
  ];

  test("an open roadmap item sits in a phase section", () => {
    expect.hasAssertions();

    const lines = readFileSync(ROADMAP_PATH, "utf8").split("\n");
    const offendingLines: string[] = [];
    let underPhase = false;
    for (const [index, line] of lines.entries())
      if (HEADING_REGEX.test(line)) underPhase = readRoadmapPhaseHeading(line) !== undefined;
      else if (OPEN_ITEM_REGEX.test(line) && !underPhase) offendingLines.push(`${index + 1}: ${line}`);

    expect(offendingLines).toStrictEqual([]);
  });

  // A stand-in for a picture the game draws names the picture as an Asset line, and that line names its source
  test("a stand-in has a roadmap line", () => {
    expect.hasAssertions();

    const assetLines = readFileSync(ROADMAP_PATH, "utf8")
      .split("\n")
      .filter((line) => ASSET_LINE_REGEX.test(line));
    const picturesWithoutLine = STAND_IN_PICTURES.filter(
      (picture) => !assetLines.some((line) => line.includes(picture) && line.includes("source:")),
    );

    expect(picturesWithoutLine).toStrictEqual([]);
  });
});
