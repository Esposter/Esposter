import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { readGcsimCitedCandidates } from "#src/services/genshinAssets/kits/gcsim/readGcsimCitedCandidates";
import { CombatTalent } from "genshin-world";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const overlayFor = (path: string): KitOverlay => ({
  [path]: { file: "attack.go", line: 9, source: KitSource.Gcsim, value: { angle: 2 * Math.PI, height: 2, radius: 4 } },
});

describe("readGcsimCitedCandidates table cells", () => {
  const FOLDER = "aino";

  // The talents' proud skill groups, as the cited reader reads a named hit's targeting area by them
  const TALENT_GROUP_ID_MAP = {
    [CombatTalent.ElementalBurst]: 3,
    [CombatTalent.ElementalSkill]: 2,
    [CombatTalent.NormalAttack]: 1,
  };
  // Row 0 is on line 4 and row 1 on line 5; the constructor's own line is 9
  const TABLE_GO = [
    "package aino",
    "",
    "var widths = [][]float64{",
    "\t{2.5},",
    "\t{4, 5},",
    "}",
    "",
    "func attack() {",
    "\tap := combat.NewCircleHitOnTarget(",
    "\t\tc.Core.Combat.Player(),",
    "\t\tnil,",
    "\t\twidths[c.NormalCounter][0],",
    "\t)",
    "}",
    "",
  ].join("\n");
  const UNEVALUABLE_GO = TABLE_GO.replace("widths[c.NormalCounter][0]", "widths[i][0]");
  const createGcsimDirectory = (source: string) => {
    const directory = mkdtempSync(join(tmpdir(), "gcsim-table-cells-"));
    mkdirSync(join(directory, "internal", "characters", FOLDER), { recursive: true });
    writeFileSync(join(directory, "internal", "characters", FOLDER, "attack.go"), source);
    return directory;
  };

  test("a table cell read at the action's counter is cited by the line of its row", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(
        overlayFor("normalAttacks.1.hits.0.area"),
        createGcsimDirectory(TABLE_GO),
        FOLDER,
        TALENT_GROUP_ID_MAP,
      ).get("normalAttacks.1.hits.0.area") ?? [];
    expect(candidates).toStrictEqual([
      {
        provenance: { file: "internal/characters/aino/attack.go", line: 5, source: KitSource.Gcsim },
        value: { angle: 2 * Math.PI, height: 2, radius: 4 },
      },
    ]);
  });

  test("the counter selects the row, so the first action's row is the one cited", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(
        overlayFor("normalAttacks.0.hits.0.area"),
        createGcsimDirectory(TABLE_GO),
        FOLDER,
        TALENT_GROUP_ID_MAP,
      ).get("normalAttacks.0.hits.0.area") ?? [];
    expect(candidates[0]).toStrictEqual({
      provenance: { file: "internal/characters/aino/attack.go", line: 4, source: KitSource.Gcsim },
      value: { angle: 2 * Math.PI, height: 2, radius: 2.5 },
    });
  });

  test("an index that is neither a literal nor the counter gives no area, so nothing is guessed", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(
        overlayFor("normalAttacks.1.hits.0.area"),
        createGcsimDirectory(UNEVALUABLE_GO),
        FOLDER,
        TALENT_GROUP_ID_MAP,
      ).get("normalAttacks.1.hits.0.area") ?? [];
    expect(candidates).toStrictEqual([]);
  });
});
