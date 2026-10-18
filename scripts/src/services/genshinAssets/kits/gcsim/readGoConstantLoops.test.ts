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

  test("reads a counting loop to a literal bound inclusively, one iteration per step up to and including the bound", () => {
    expect.hasAssertions();

    const source = [
      "package xiangling",
      "",
      "func (c *char) burst() {",
      "\tfor delay := 0; delay <= 8; delay += 4 {",
      "\t\tc.Core.QueueAttack(ai, ap, 0, delay)",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

    expect(
      readConstantLoops(tokens, createGoScope(tokens, constantMap)).map(({ iterations }) => iterations),
    ).toStrictEqual([[new Map([["delay", 0]]), new Map([["delay", 4]]), new Map([["delay", 8]])]]);
  });

  test("reads a counting loop's bound from the local's base value, a constellation branch's reassignment left out", () => {
    expect.hasAssertions();

    const source = [
      "package xiangling",
      "",
      "func (c *char) burst() {",
      "\tmaxDuration := 10",
      "\tif c.Base.Cons >= 4 {",
      "\t\tmaxDuration = 14",
      "\t}",
      "\tfor delay := 0; delay <= maxDuration; delay += 4 {",
      "\t\tc.Core.QueueAttack(ai, ap, 0, delay)",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

    expect(
      readConstantLoops(tokens, createGoScope(tokens, constantMap)).map(({ iterations }) => iterations),
    ).toStrictEqual([[new Map([["delay", 0]]), new Map([["delay", 4]]), new Map([["delay", 8]])]]);
  });

  test("reads no loop from a bound a branch that is no constellation branch reassigns", () => {
    expect.hasAssertions();

    const source = [
      "package xiangling",
      "",
      "func (c *char) burst() {",
      "\tmaxDuration := 10",
      "\tif c.Core.Rand.Float64() < 0.5 {",
      "\t\tmaxDuration = 14",
      "\t}",
      "\tfor delay := 0; delay <= maxDuration; delay += 4 {",
      "\t\tc.Core.QueueAttack(ai, ap, 0, delay)",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

    expect(readConstantLoops(tokens, createGoScope(tokens, constantMap))).toStrictEqual([]);
  });
});
