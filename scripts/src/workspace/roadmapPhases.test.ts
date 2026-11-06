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
});
