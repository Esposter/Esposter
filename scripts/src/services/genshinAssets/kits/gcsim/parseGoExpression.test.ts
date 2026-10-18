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

  test("a control clause's bare name ends at its brace, which opens the clause's block rather than a composite literal", () => {
    expect.hasAssertions();

    const tokens = tokenizeGo("tick {\n\tbody\n}");

    expect(parseGoExpression(tokens, 0, true)).toStrictEqual({
      end: 1,
      expression: { kind: GoExpressionKind.Identifier, name: "tick" },
    });
  });
});
