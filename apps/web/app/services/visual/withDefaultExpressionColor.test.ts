import type { Expression } from "@/models/desmos/Expression";

import { Colors } from "@/models/desmos/Colors";
import { withDefaultExpressionColor } from "@/services/visual/withDefaultExpressionColor";
import { describe, expect, test } from "vitest";

describe(withDefaultExpressionColor, () => {
  test("an expression without a colour is given the default one", () => {
    expect.hasAssertions();

    expect(withDefaultExpressionColor({ latex: "y=x" })).toStrictEqual({ color: Colors.Black, latex: "y=x" });
  });

  test("an expression with a colour keeps it", () => {
    expect.hasAssertions();

    const expression: Expression = { color: Colors.Red, latex: "y=x" };

    expect(withDefaultExpressionColor(expression)).toStrictEqual(expression);
  });

  // The expression sets are module constants, so a colour written onto one would stay for every later drawing
  test("the expression it was given is left without a colour", () => {
    expect.hasAssertions();

    const expression: Expression = { latex: "y=x" };
    withDefaultExpressionColor(expression);

    expect(expression).toStrictEqual({ latex: "y=x" });
  });
});
