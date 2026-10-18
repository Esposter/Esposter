import { createGoScope } from "#src/services/genshinAssets/kits/gcsim/createGoScope";
import { evaluateGoConstants } from "#src/services/genshinAssets/kits/gcsim/evaluateGoConstants";
import { readConstantLoops } from "#src/services/genshinAssets/kits/gcsim/readGoConstantLoops";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { describe, expect, test } from "vitest";

describe(readConstantLoops, () => {
  test("reads a loop over a constant slice as one iteration per element, its index and element as the variables", () => {
    expect.hasAssertions();

    const source = [
      "package odette",
      "",
      "var burstHitmarks = []int{112, 112 + 16, 112 + 16 + 12}",
      "",
      "func (c *char) burst() {",
      "\tfor i, delay := range burstHitmarks {",
      "\t\tc.QueueCharTask(func() { c.Core.QueueAttack(aiCopy, ap, 0, 0) }, delay)",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

    expect(
      readConstantLoops(tokens, createGoScope(tokens, constantMap)).map(({ iterations }) => iterations),
    ).toStrictEqual([
      [
        new Map([
          ["i", 0],
          ["delay", 112],
        ]),
        new Map([
          ["i", 1],
          ["delay", 128],
        ]),
        new Map([
          ["i", 2],
          ["delay", 140],
        ]),
      ],
    ]);
  });
});
