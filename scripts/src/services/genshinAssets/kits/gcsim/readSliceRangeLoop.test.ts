import { GCSIM_EMPTY_CONFIG } from "#src/services/genshinAssets/kits/gcsim/constants.test";
import { evaluateGoConstants } from "#src/services/genshinAssets/kits/gcsim/evaluateGoConstants";
import { readGcsimConfig } from "#src/services/genshinAssets/kits/gcsim/readGcsimConfig";
import { readSliceRangeLoop } from "#src/services/genshinAssets/kits/gcsim/readSliceRangeLoop";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { describe, expect, test } from "vitest";

describe(readSliceRangeLoop, () => {
  test("binds the index of a range over a constant nested slice, once per row", () => {
    expect.hasAssertions();

    const source = [
      "package durin",
      "",
      "var rows = [][]float64{{1.1, 2.2}, {3.3, 4.4}, {5.5, 6.6}}",
      "",
      "func (c *char) burst() {",
      "\tfor i := range rows {",
      "\t\tc.Core.QueueAttack(ai, ap, 0, i)",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

    expect(
      readSliceRangeLoop(
        tokens,
        tokens.findIndex(({ text }) => text === "for"),
        (name) => constantMap.get(name)?.value,
        GCSIM_EMPTY_CONFIG,
      )?.iterations,
    ).toStrictEqual([new Map([["i", 0]]), new Map([["i", 1]]), new Map([["i", 2]])]);
  });

  test("binds the index alone where a range over rows names a value variable, as a row is no number", () => {
    expect.hasAssertions();

    const source = [
      "package durin",
      "",
      "var rows = [][]float64{{1.1, 2.2}, {3.3, 4.4}, {5.5, 6.6}}",
      "",
      "func (c *char) burst() {",
      "\tfor i, mult := range rows {",
      "\t\tc.Core.QueueAttack(ai, ap, 0, i)",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

    expect(
      readSliceRangeLoop(
        tokens,
        tokens.findIndex(({ text }) => text === "for"),
        (name) => constantMap.get(name)?.value,
        GCSIM_EMPTY_CONFIG,
      )?.iterations,
    ).toStrictEqual([new Map([["i", 0]]), new Map([["i", 1]]), new Map([["i", 2]])]);
  });

  test("reads no loop from a range over rows one of which is not a constant number slice", () => {
    expect.hasAssertions();

    const source = [
      "package durin",
      "",
      "var rows = [][]float64{{1.1, 2.2}, {c.Base.Value}, {3.3, 4.4}}",
      "",
      "func (c *char) burst() {",
      "\tfor i := range rows {",
      "\t\tc.Core.QueueAttack(ai, ap, 0, i)",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const constantMap = evaluateGoConstants([{ path: "burst.go", source }]);

    expect(
      readSliceRangeLoop(
        tokens,
        tokens.findIndex(({ text }) => text === "for"),
        (name) => constantMap.get(name)?.value,
        GCSIM_EMPTY_CONFIG,
      ),
    ).toBeUndefined();
  });

  test("runs a range over a talent table once per row", () => {
    expect.hasAssertions();

    const source = [
      "package durin",
      "",
      "func (c *char) burst() {",
      "\tfor i, mult := range burstWhiteInitial {",
      "\t\tc.Core.QueueAttack(ai, ap, burstInitHitmark[i], burstInitHitmark[i])",
      "\t}",
      "}",
    ].join("\n");
    const tokens = tokenizeGo(source);
    const config = readGcsimConfig(
      [
        "names:",
        "  - durin",
        "talents:",
        "  - burstWhiteInitial:",
        "      - 'burst(Principle of Purity: As the Light Shifts DMG)'",
        "      - 'burst(Principle of Purity: As the Light Shifts DMG|1)'",
        "      - 'burst(Principle of Purity: As the Light Shifts DMG|2)'",
      ].join("\n"),
    );

    expect(
      readSliceRangeLoop(
        tokens,
        tokens.findIndex(({ text }) => text === "for"),
        () => undefined,
        config,
      )?.iterations,
    ).toStrictEqual([new Map([["i", 0]]), new Map([["i", 1]]), new Map([["i", 2]])]);
  });
});
