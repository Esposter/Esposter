import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { GCSIM_CONFIG_FILE, GO_COMPOUND_ASSIGNMENT_OPERATORS } from "#src/services/genshinAssets/kits/constants";
import { TALENT_GROUP_ID_MAP } from "#src/services/genshinAssets/kits/constants.test";
import { readGcsimCharacter } from "#src/services/genshinAssets/kits/gcsim/readGcsimCharacter";
import { readGcsimCitedCandidates } from "#src/services/genshinAssets/kits/gcsim/readGcsimCitedCandidates";
import { resolveGoLocals } from "#src/services/genshinAssets/kits/gcsim/resolveGoLocals";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const overlayFor = (path: string, line = 5): KitOverlay => ({
  [path]: { file: "burst.go", line, source: KitSource.Gcsim, value: { angle: 2 * Math.PI, height: 2, radius: 4 } },
});

describe("readGcsimCitedCandidates local aliases", () => {
  const FOLDER = "aino";

  const createGcsimDirectory = (source: string) => {
    const directory = mkdtempSync(join(tmpdir(), "gcsim-locals-"));
    mkdirSync(join(directory, "internal", "characters", FOLDER), { recursive: true });
    writeFileSync(join(directory, "internal", "characters", FOLDER, "burst.go"), source);
    return directory;
  };

  const createCharacter = (source: string) =>
    readGcsimCharacter(
      FOLDER,
      new Map([
        ["burst.go", source],
        [GCSIM_CONFIG_FILE, "name: aino\n"],
      ]),
    );
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
  // The radius is declared, then written again in a branch before the constructor, so it holds either value there
  const BRANCH_GO = [
    "package aino",
    "",
    "func burst() {",
    "\tradius := 3.0",
    "\tif c.StatusIsActive(key) {",
    "\t\tradius = 6",
    "\t}",
    "\tap := combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, radius)",
    "}",
    "",
  ].join("\n");
  // The radius is written again after the constructor, which a loop could carry round to it, so it is not known
  const WRITTEN_AFTER_GO = [
    "package aino",
    "",
    "func burst() {",
    "\tradius := 3.0",
    "\tap := combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, radius)",
    "\tradius = 6",
    "}",
    "",
  ].join("\n");
  // The radius is declared in the loop's body, from the table row of the loop's index, and read in a closure under it
  const LOOP_GO = [
    "package aino",
    "",
    "var burstRadius = []float64{2.5, 2.5, 3}",
    "",
    "func burst() {",
    "\tfor i := range burstHitmarks {",
    "\t\tradius := burstRadius[i]",
    "\t\tc.QueueCharTask(func() {",
    "\t\t\tc.Core.QueueAttack(ai, combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, radius), 0, 0)",
    "\t\t}, burstHitmarks[i])",
    "\t}",
    "}",
    "",
  ].join("\n");
  // Two tables read by the loop's index, a circle offset by one and sized by the other
  const PAIRED_LOOP_GO = [
    "package aino",
    "",
    "var skillHitboxes = [][]float64{{3}, {3.5, 4.5}}",
    "var skillOffsets = []float64{0.8, -1.5}",
    "",
    "func skill() {",
    "\tfor i, v := range rainscreen {",
    "\t\tap := combat.NewCircleHitOnTarget(",
    "\t\t\tc.Core.Combat.Player(),",
    "\t\t\tinfo.Point{Y: skillOffsets[i]},",
    "\t\t\tskillHitboxes[i][0],",
    "\t\t)",
    "\t}",
    "}",
    "",
  ].join("\n");

  test("a single-assignment alias reads as its right-hand side, and the constructor's line is cited", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(
        overlayFor("burst.area"),
        createGcsimDirectory(SINGLE_GO),
        createCharacter(SINGLE_GO),
        TALENT_GROUP_ID_MAP,
      ).get("burst.area") ?? [];
    // The constructor's forward offset of 1 is folded into its radius of 4, as a body circle's reach is priced
    expect(candidates).toStrictEqual([
      {
        provenance: { file: "internal/characters/aino/burst.go", line: 5, source: KitSource.Gcsim },
        value: { angle: 2 * Math.PI, height: 2, radius: 5 },
      },
    ]);
  });

  // The alias's expression is read as one operand, so `r*2` is (2 + 3) * 2, not 2 + 3 * 2
  const SUM_GO = [
    "package aino",
    "",
    "func burst() {",
    "\tr := 2 + 3",
    "\tap := combat.NewCircleHit(c.Core.Combat.Player(), nil, nil, r*2)",
    "}",
    "",
  ].join("\n");

  test("a local bound to a sum is read as one operand of the expression that uses it", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(
        {
          "burst.area": {
            file: "burst.go",
            line: 5,
            source: KitSource.Gcsim,
            value: { angle: 2 * Math.PI, height: 2, radius: 10 },
          },
        },
        createGcsimDirectory(SUM_GO),
        createCharacter(SUM_GO),
        TALENT_GROUP_ID_MAP,
      ).get("burst.area") ?? [];
    expect(candidates).toStrictEqual([
      {
        provenance: { file: "internal/characters/aino/burst.go", line: 5, source: KitSource.Gcsim },
        value: { angle: 2 * Math.PI, height: 2, radius: 10 },
      },
    ]);
  });

  // The alias's expression holds a bitwise or, which binds looser than `*`, so `r*2` is (1 | 2) * 2, not 1 | 2*2
  test("a local bound to a bitwise expression is wrapped where it is spliced", () => {
    expect.hasAssertions();
    const lines = [
      "package aino",
      "",
      "func burst() {",
      "\tr := 1 | 2",
      "\tap := combat.NewCircleHit(c.Core.Combat.Player(), nil, nil, r*2)",
      "}",
    ];
    expect(resolveGoLocals("r*2", lines, 4)).toStrictEqual(["(1 | 2)*2"]);
  });

  // The alias is updated by a compound assignment after its declaration, so its value is not the declared 2
  // And reads as unknown
  test.each(GO_COMPOUND_ASSIGNMENT_OPERATORS)(
    "a local a later `%s=` update changes reads as unknown, not as its declaration's value",
    (operator) => {
      expect.hasAssertions();
      const lines = [
        "package aino",
        "",
        "func burst() {",
        "\tr := 2",
        `\tr ${operator}= 1`,
        "\tap := combat.NewCircleHit(c.Core.Combat.Player(), nil, nil, r*2)",
        "}",
      ];
      expect(resolveGoLocals("r*2", lines, 5)).toBeUndefined();
    },
  );

  test("a local written again in a branch gives an area for each value it may hold, in the order they are written", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(
        overlayFor("burst.area", 8),
        createGcsimDirectory(BRANCH_GO),
        createCharacter(BRANCH_GO),
        TALENT_GROUP_ID_MAP,
      ).get("burst.area") ?? [];
    const provenance = { file: "internal/characters/aino/burst.go", line: 8, source: KitSource.Gcsim };
    expect(candidates).toStrictEqual([
      { provenance, value: { angle: 2 * Math.PI, height: 2, radius: 3 } },
      { provenance, value: { angle: 2 * Math.PI, height: 2, radius: 6 } },
    ]);
  });

  test("a local written again after the constructor gives no area, as a loop could carry the write round to it", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(
        overlayFor("burst.area", 5),
        createGcsimDirectory(WRITTEN_AFTER_GO),
        createCharacter(WRITTEN_AFTER_GO),
        TALENT_GROUP_ID_MAP,
      ).get("burst.area") ?? [];
    expect(candidates).toStrictEqual([]);
  });

  test("a radius declared in a loop's body from the row of the loop's index is cited by its table's line, and gives the area of each row", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(
        overlayFor("burst.area", 3),
        createGcsimDirectory(LOOP_GO),
        createCharacter(LOOP_GO),
        TALENT_GROUP_ID_MAP,
      ).get("burst.area") ?? [];
    const provenance = { file: "internal/characters/aino/burst.go", line: 3, source: KitSource.Gcsim };
    expect(candidates).toStrictEqual([
      { provenance, value: { angle: 2 * Math.PI, height: 2, radius: 2.5 } },
      { provenance, value: { angle: 2 * Math.PI, height: 2, radius: 2.5 } },
      { provenance, value: { angle: 2 * Math.PI, height: 2, radius: 3 } },
    ]);
  });

  test("two tables read by the loop's index are read at the same row together, not row against row", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(
        overlayFor("skill.area", 8),
        createGcsimDirectory(PAIRED_LOOP_GO),
        createCharacter(PAIRED_LOOP_GO),
        TALENT_GROUP_ID_MAP,
      ).get("skill.area") ?? [];
    // Row 0 sizes the circle at 3 and moves it 0.8, and row 1 sizes it at 3.5 and moves it back 1.5, so the radius is the
    // Size and the forward offset together: 3.8, and 3.5 less 1.5 is 2
    expect(candidates.map(({ value }) => (value as { radius: number }).radius)).toStrictEqual([3.8, 2]);
  });
});
