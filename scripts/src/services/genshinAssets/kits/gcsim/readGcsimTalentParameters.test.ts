import { GCSIM_FIXTURE_DIRECTORY } from "#src/services/genshinAssets/kits/gcsim/constants.test";
import { readGcsimTalentParameters } from "#src/services/genshinAssets/kits/gcsim/readGcsimTalentParameters";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(readGcsimTalentParameters, () => {
  test("reads each label of Xiangling's talent file once, with the indexes its formula reads", () => {
    expect.hasAssertions();

    const source = readFileSync(join(GCSIM_FIXTURE_DIRECTORY, "zz_xiangling.dm.go"), "utf8");

    expect(readGcsimTalentParameters(source)).toStrictEqual(
      new Map([
        ["attack|1-Hit DMG", [{ index: 0, line: 4 }]],
        ["attack|2-Hit DMG", [{ index: 1, line: 5 }]],
        [
          "attack|3-Hit DMG",
          [
            { index: 2, line: 6 },
            { index: 2, line: 7 },
          ],
        ],
        ["attack|4-Hit DMG", [{ index: 3, line: 8 }]],
        ["attack|5-Hit DMG", [{ index: 4, line: 12 }]],
        ["attack|Charged Attack DMG", [{ index: 5, line: 13 }]],
        [
          "attack|Low/High Plunge DMG",
          [
            { index: 8, line: 15 },
            { index: 9, line: 16 },
          ],
        ],
        ["attack|Plunge DMG", [{ index: 7, line: 14 }]],
        ["burst|1-Hit Swing DMG", [{ index: 0, line: 18 }]],
        ["burst|2-Hit Swing DMG", [{ index: 1, line: 19 }]],
        ["burst|3-Hit Swing DMG", [{ index: 2, line: 20 }]],
        ["burst|Pyronado DMG", [{ index: 3, line: 21 }]],
        ["skill|Flame DMG", [{ index: 0, line: 17 }]],
      ]),
    );
  });

  test("gives each parameter of a label written once per row the line of its own row", () => {
    expect.hasAssertions();

    const source = [
      "\tburstWhiteInitial = [][]float64{",
      "\t\t{ // burst: PrincipleOfPurityAsTheLightShifts - Principle of Purity: As the Light Shifts DMG: {0}+{1}+{2}",
      "\t\t\t1.5,",
      "\t\t},",
      "\t\t{ // burst: PrincipleOfPurityAsTheLightShifts - Principle of Purity: As the Light Shifts DMG: {0}+{1}+{2}",
      "\t\t\t2.5,",
      "\t\t},",
      "\t\t{ // burst: PrincipleOfPurityAsTheLightShifts - Principle of Purity: As the Light Shifts DMG: {0}+{1}+{2}",
      "\t\t\t3.5,",
      "\t\t},",
      "\t}",
    ].join("\n");

    expect(readGcsimTalentParameters(source)).toStrictEqual(
      new Map([
        [
          "burst|Principle of Purity: As the Light Shifts DMG",
          [
            { index: 0, line: 2 },
            { index: 1, line: 5 },
            { index: 2, line: 8 },
          ],
        ],
      ]),
    );
  });

  test("gives every parameter of a label written on one row that row's line", () => {
    expect.hasAssertions();

    const source = [
      "\tburstWhiteInitial = [][]float64{",
      "\t\t{ // burst: Fixture - Blast DMG: {0}+{1}",
      "\t\t\t1.5,",
      "\t\t},",
      "\t}",
    ].join("\n");

    expect(readGcsimTalentParameters(source)).toStrictEqual(
      new Map([
        [
          "burst|Blast DMG",
          [
            { index: 0, line: 2 },
            { index: 1, line: 2 },
          ],
        ],
      ]),
    );
  });
});
