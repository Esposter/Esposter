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

const overlayFor = (path: string): KitOverlay => ({
  [path]: { file: "burst.go", line: 5, source: KitSource.Gcsim, value: { angle: 2 * Math.PI, height: 2, radius: 4 } },
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
    expect(resolveGoLocals("r*2", lines, 4)).toBe("(1 | 2)*2");
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

  test("an alias assigned more than once gives no area, so nothing is guessed", () => {
    expect.hasAssertions();
    const candidates =
      readGcsimCitedCandidates(
        overlayFor("burst.area"),
        createGcsimDirectory(REASSIGNED_GO),
        createCharacter(REASSIGNED_GO),
        TALENT_GROUP_ID_MAP,
      ).get("burst.area") ?? [];
    expect(candidates).toStrictEqual([]);
  });
});
