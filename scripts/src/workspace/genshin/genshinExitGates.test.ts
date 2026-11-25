import { GENSHIN_PHASE_GATES } from "#src/services/genshinProgress/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The progress report prints a copy of each phase's exit gate clauses, so a clause the design's phases table no longer
// Holds is printed in words the design does not carry. Each clause must sit in its own phase's row of that table
describe("genshinExitGates", () => {
  const PHASES_DESIGN_PATH = join(REPOSITORY_ROOT, "openspec/changes/genshin-phases/design.md");

  test("the report's gate clauses are the design's", () => {
    expect.hasAssertions();

    const lines = readFileSync(PHASES_DESIGN_PATH, "utf8").split("\n");
    const unfound = GENSHIN_PHASE_GATES.filter(
      ({ gate, phase }) => !lines.some((line) => line.startsWith(`| ${phase} `) && line.includes(gate)),
    ).map(({ gate, phase }) => `${phase}: ${gate}`);

    expect(unfound).toStrictEqual([]);
  });
});
