import { GO_COMPOUND_ASSIGNMENT_OPERATORS } from "#src/services/genshinAssets/kits/constants";
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

  test("leaves the blank identifier out of a slice loop's iterations, which names no variable", () => {
    expect.hasAssertions();

    const source = [
      "package chongyun",
      "",
      "var burstHitmarks = []int{50, 59, 67}",
      "",
      "func (c *char) burst() {",
      "\tfor _, hitmark := range burstHitmarks {",
      "\t\tc.Core.QueueAttack(ap, 0, 0, hitmark)",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

    expect(
      readConstantLoops(tokens, createGoScope(tokens, constantMap)).map(({ iterations }) => iterations),
    ).toStrictEqual([[new Map([["hitmark", 50]]), new Map([["hitmark", 59]]), new Map([["hitmark", 67]])]]);
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

  test("reads a loop whose step is a call as its first iteration alone, its variable at the start, as the step has no value", () => {
    expect.hasAssertions();

    const source = [
      "package aino",
      "",
      "func (c *char) burst() {",
      "\tfor i := 0; i < 14.2*60; i += c.a1BurstEnhance() {",
      "\t\tc.Core.Tasks.Add(func() { c.Core.QueueAttack(ai, ap, 0, i) }, i+123)",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

    expect(
      readConstantLoops(tokens, createGoScope(tokens, constantMap)).map(({ iterations }) => iterations),
    ).toStrictEqual([[new Map([["i", 0]])]]);
  });

  test("reads no iteration of a loop whose step is a call where its bound stops it before its start", () => {
    expect.hasAssertions();

    const source = [
      "package aino",
      "",
      "func (c *char) burst() {",
      "\tfor i := 900; i < 14.2*60; i += c.a1BurstEnhance() {",
      "\t\tc.Core.Tasks.Add(func() { c.Core.QueueAttack(ai, ap, 0, i) }, i+123)",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

    expect(
      readConstantLoops(tokens, createGoScope(tokens, constantMap)).map(({ iterations }) => iterations),
    ).toStrictEqual([[]]);
  });

  test("reads a loop whose step is a bare local, the brace after it the loop's body and no composite literal", () => {
    expect.hasAssertions();

    const source = [
      "package aino",
      "",
      "func (c *char) burst() {",
      "\ttick := 2",
      "\tfor i := 0; i < 5; i += tick {",
      "\t\tc.Core.QueueAttack(ai, ap, 0, i)",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

    expect(
      readConstantLoops(tokens, createGoScope(tokens, constantMap)).map(({ iterations }) => iterations),
    ).toStrictEqual([[new Map([["i", 0]]), new Map([["i", 2]]), new Map([["i", 4]])]]);
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

  // The bound is a local a compound assignment updates after its declaration, so its value is not the declared 2
  test.each(GO_COMPOUND_ASSIGNMENT_OPERATORS)(
    "reads no loop from a bound a later `%s=` update changes, not as its declaration's value",
    (operator) => {
      expect.hasAssertions();

      const source = [
        "package xiangling",
        "",
        "func (c *char) burst() {",
        "\tx := 2",
        `\tx ${operator}= 4`,
        "\tfor i := 0; i < x; i++ {",
        "\t\tc.Core.QueueAttack(ai, ap, 0, i)",
        "\t}",
        "}",
      ].join("\n");
      const tokens = tokenizeGo(source);
      const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

      expect(readConstantLoops(tokens, createGoScope(tokens, constantMap))).toStrictEqual([]);
    },
  );
});
