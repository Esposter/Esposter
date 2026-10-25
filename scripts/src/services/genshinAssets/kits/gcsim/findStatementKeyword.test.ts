import { findStatementKeyword } from "#src/services/genshinAssets/kits/gcsim/findStatementKeyword";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { describe, expect, test } from "vitest";

describe(findStatementKeyword, () => {
  test("finds no keyword for a function literal's brace inside an if's init statement", () => {
    expect.hasAssertions();

    const tokens = tokenizeGo("if x := func() int { return 1 }(); x > 0 { attack() }");
    const literalOpenPosition = tokens.findIndex((token) => token.text === "{");

    expect(findStatementKeyword(tokens, literalOpenPosition, "if")).toBeUndefined();
  });
});
