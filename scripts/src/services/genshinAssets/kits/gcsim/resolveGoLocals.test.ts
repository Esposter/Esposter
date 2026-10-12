import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { readGcsimCitedCandidates } from "#src/services/genshinAssets/kits/gcsim/readGcsimCitedCandidates";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("readGcsimCitedCandidates local aliases", () => {
  const FOLDER = "aino";
  const createGcsimDirectory = (source: string) => {
    const directory = mkdtempSync(join(tmpdir(), "gcsim-locals-"));
    mkdirSync(join(directory, "internal", "characters", FOLDER), { recursive: true });
    writeFileSync(join(directory, "internal", "characters", FOLDER, "burst.go"), source);
    return directory;
  };
  const overlayFor = (path: string): KitOverlay => ({
    [path]: { file: "burst.go", line: 5, source: KitSource.Gcsim, value: { angle: 2 * Math.PI, height: 2, radius: 4 } },
  });
  // The alias is bound once, `player := c.Core.Combat.Player()`, before the constructor that reads it
  const SINGLE_GO = [
    "package aino",
    "",
    "func burst() {",
    "\tplayer := c.Core.Combat.Player()",
    "\tap := combat.NewCircleHitOnTarget(",
    "\t\tplayer,",
    "\t\tinfo.Point{Y: 1},",
    "\t\t4,",
    "\t)",
    "}",
    "",
  ].join("\n");
  // The alias is bound again before the constructor, so its value is not known from the text
  const REASSIGNED_GO = [
    "package aino",
    "",
    "func burst() {",
    "\tplayer := c.Core.Combat.Player()",
    "\tplayer = c.Core.Combat.PrimaryTarget()",
    "\tap := combat.NewCircleHitOnTarget(",
    "\t\tplayer,",
    "\t\tinfo.Point{Y: 1},",
    "\t\t4,",
    "\t)",
    "}",
    "",
  ].join("\n");

  test("a single-assignment alias reads as its right-hand side, and the constructor's line is cited", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(overlayFor("burst.area"), createGcsimDirectory(SINGLE_GO), FOLDER).get("burst.area") ??
      [];
    expect(candidates).toStrictEqual([
      {
        provenance: { file: "internal/characters/aino/burst.go", line: 5, source: KitSource.Gcsim },
        value: { angle: 2 * Math.PI, height: 2, radius: 4 },
      },
    ]);
  });

  test("an alias assigned more than once gives no area, so nothing is guessed", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(overlayFor("burst.area"), createGcsimDirectory(REASSIGNED_GO), FOLDER).get(
        "burst.area",
      ) ?? [];
    expect(candidates).toStrictEqual([]);
  });
});
