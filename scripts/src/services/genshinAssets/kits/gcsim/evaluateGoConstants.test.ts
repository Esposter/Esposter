import { GCSIM_FIXTURE_DIRECTORY } from "#src/services/genshinAssets/kits/gcsim/constants.test";
import { evaluateGoConstants } from "#src/services/genshinAssets/kits/gcsim/evaluateGoConstants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(evaluateGoConstants, () => {
  test("reads Xiangling's attack.go as gcsim writes it, the frames her init sets one strike at a time", () => {
    expect.hasAssertions();

    const name = "attack.go";
    const source = readFileSync(join(GCSIM_FIXTURE_DIRECTORY, name), "utf8");

    expect(evaluateGoConstants([{ path: name, source }])).toStrictEqual(
      new Map([
        [
          "attackFrames",
          {
            elementLines: { 0: 35, 1: 37, 2: 39, 3: 42, 4: 45 },
            file: name,
            line: 33,
            value: [
              { animationFrames: 20, hitmarkFrames: 12 },
              { animationFrames: 17, hitmarkFrames: 8 },
              { animationFrames: 28, hitmarkFrames: 18 },
              { animationFrames: 37, hitmarkFrames: 29 },
              { animationFrames: 70, hitmarkFrames: 21 },
            ],
          },
        ],
        [
          "attackHitboxes",
          {
            elementLines: {},
            file: name,
            line: 18,
            value: [
              [[1.2, 3]],
              [[1.6, 3.3]],
              [
                [1.6, 3.3],
                [1.2, 3.3],
              ],
              [
                [1.2, 3.3],
                [1.2, 3.3],
                [1.2, 3.3],
                [1.2, 3.3],
              ],
              [[1.6, 3.3]],
            ],
          },
        ],
        [
          "attackHitlagHaltFrame",
          { elementLines: {}, file: name, line: 17, value: [[0.03], [0.03], [0.03, 0], [0, 0, 0, 0.03], [0.09]] },
        ],
        [
          "attackHitmarks",
          { elementLines: {}, file: name, line: 16, value: [[12], [8], [11, 18], [5, 15, 24, 29], [21]] },
        ],
        ["normalHitNum", { elementLines: {}, file: name, line: 28, value: 5 }],
      ]),
    );
  });

  test("evaluates an index named by iota as the spec's place in its const group", () => {
    expect.hasAssertions();

    const source = [
      "package ningguang",
      "",
      "const (",
      "\tattackTypeLeft attackType = iota",
      "\tattackTypeRight",
      "\tattackTypeTwirl",
      ")",
      "",
      "var attackFrames [][]int",
      "",
      "func init() {",
      "\tattackFrames = make([][]int, 3)",
      "\tattackFrames[attackTypeRight] = frames.InitAbilSlice(9)",
      "}",
      "",
    ].join("\n");

    expect(evaluateGoConstants([{ path: "attack.go", source }]).get("attackFrames")?.value).toHaveProperty("1", {
      animationFrames: 9,
    });
  });
});
