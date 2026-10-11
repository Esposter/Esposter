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
        ["attack|1-Hit DMG", { indexes: [0], line: 4 }],
        ["attack|2-Hit DMG", { indexes: [1], line: 5 }],
        ["attack|3-Hit DMG", { indexes: [2, 2], line: 6 }],
        ["attack|4-Hit DMG", { indexes: [3], line: 8 }],
        ["attack|5-Hit DMG", { indexes: [4], line: 12 }],
        ["attack|Charged Attack DMG", { indexes: [5], line: 13 }],
        ["attack|Low/High Plunge DMG", { indexes: [8, 9], line: 15 }],
        ["attack|Plunge DMG", { indexes: [7], line: 14 }],
        ["burst|1-Hit Swing DMG", { indexes: [0], line: 18 }],
        ["burst|2-Hit Swing DMG", { indexes: [1], line: 19 }],
        ["burst|3-Hit Swing DMG", { indexes: [2], line: 20 }],
        ["burst|Pyronado DMG", { indexes: [3], line: 21 }],
        ["skill|Flame DMG", { indexes: [0], line: 17 }],
      ]),
    );
  });
});
