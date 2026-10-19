import { readGcsimConfig } from "#src/services/genshinAssets/kits/gcsim/readGcsimConfig";
import { readSliceRangeLoop } from "#src/services/genshinAssets/kits/gcsim/readSliceRangeLoop";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { describe, expect, test } from "vitest";

// Durin's white burst, whose talent table lists one row per initial hit
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

describe(readSliceRangeLoop, () => {
  test("binds the index alone where a range over rows names a value variable, as a row is no number", () => {
    expect.hasAssertions();

    const tokens = tokenizeGo(
      [
        "package durin",
        "",
        "func (c *char) burst() {",
        "\tfor i, mult := range burstWhiteInitial {",
        "\t\tc.Core.QueueAttack(ai, ap, 0, i)",
        "\t}",
        "}",
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

  test("runs a range over a talent table once per row", () => {
    expect.hasAssertions();

    const tokens = tokenizeGo(
      [
        "package durin",
        "",
        "func (c *char) burst() {",
        "\tfor i, mult := range burstWhiteInitial {",
        "\t\tc.Core.QueueAttack(ai, ap, burstInitHitmark[i], burstInitHitmark[i])",
        "\t}",
        "}",
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
