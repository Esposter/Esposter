import { readGoLocalSlice } from "#src/services/genshinAssets/kits/gcsim/readGoLocalSlice";
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

    expect(readGoLocalSlice(tokens, "ele", tokens.length)).toStrictEqual(undefined);
  });
});
