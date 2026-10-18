import { GoExpressionKind } from "#src/models/genshinAssets/kits/gcsim/GoExpressionKind";
import { parseGoExpression } from "#src/services/genshinAssets/kits/gcsim/parseGoExpression";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { describe, expect, test } from "vitest";

describe(parseGoExpression, () => {
  test("a call's parameter starts are the tokens each argument begins at, past the newlines around it", () => {
    expect.hasAssertions();

    const tokens = tokenizeGo("Queue(\n  attack,\n  2 + 3\n)");
    const { expression } = parseGoExpression(tokens, 0);
    const parameterStarts = expression.kind === GoExpressionKind.Call ? expression.parameterStarts : [];

    expect(parameterStarts.map((start) => tokens[start]?.text)).toStrictEqual(["attack", "2"]);
  });
});
