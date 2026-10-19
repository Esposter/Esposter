import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { readGoLocalSlice } from "#src/services/genshinAssets/kits/gcsim/readGoLocalSlice";
import { readGoNamedFunctions } from "#src/services/genshinAssets/kits/gcsim/readGoNamedFunctions";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { describe, expect, test } from "vitest";

describe(readGoLocalSlice, () => {
  test("gives no slice for a local a branch reassigns after its declaration, as the branch may leave the declared value unset", () => {
    expect.hasAssertions();

    const tokens = tokenizeGo(
      [
        "func (c *char) burst(cond bool) {",
        "\tele := []attributes.Element{c.conversionElem, attributes.Anemo}",
        "\tif cond {",
        "\t\tele = []attributes.Element{attributes.Pyro}",
        "\t}",
        "}",
      ].join("\n"),
    );

    expect(readGoLocalSlice(tokens, readGoNamedFunctions(tokens), "ele", tokens.length)).toStrictEqual(undefined);
  });

  test("reads the local slice a closure reads, declared in the function the closure is in before it", () => {
    expect.hasAssertions();

    const tokens = tokenizeGo(
      [
        "func (c *char) burst() {",
        "\tele := []attributes.Element{attributes.Pyro, attributes.Cryo}",
        "\tc.Core.Tasks.Add(func() {",
        "\t\tc.Core.QueueAttack(ele[0])",
        "\t}, 1)",
        "}",
      ].join("\n"),
    );
    const position = tokens.findLastIndex((token) => token.text === "ele");

    expect(readGoLocalSlice(tokens, readGoNamedFunctions(tokens), "ele", position)).toStrictEqual({
      elements: [
        { kind: GoExpressionKind.Identifier, name: "attributes.Pyro" },
        { kind: GoExpressionKind.Identifier, name: "attributes.Cryo" },
      ],
      line: 2,
    });
  });

  test("gives no slice for a local an earlier function declares, as the search stops at the position's own function", () => {
    expect.hasAssertions();

    const tokens = tokenizeGo(
      [
        "func (c *char) a1() {",
        "\tele := []attributes.Element{attributes.Pyro}",
        "}",
        "func (c *char) burst() {",
        "\tc.Core.Tasks.Add(func() {",
        "\t\tc.Core.QueueAttack(ele[0])",
        "\t}, 1)",
        "}",
      ].join("\n"),
    );
    const position = tokens.findLastIndex((token) => token.text === "ele");

    expect(readGoLocalSlice(tokens, readGoNamedFunctions(tokens), "ele", position)).toStrictEqual(undefined);
  });
});
