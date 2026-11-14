import { getSearchExpression } from "#src/services/search/getSearchExpression";
import { describe, expect, test } from "vitest";

describe(getSearchExpression, () => {
  test("matches no words as no expression at all", () => {
    expect.hasAssertions();

    expect(getSearchExpression("   ")).toBe("");
  });

  test("or-joins the words, quoting each and making the last a prefix", () => {
    expect.hasAssertions();

    expect(getSearchExpression("hello  world")).toBe(`"hello" OR "world"*`);
  });

  // Each attack is one crafted query: a boolean operator, a proximity operator, a wildcard, a column filter, and a quote
  // that would close the term early. Each must come out as a quoted literal, so the expression carries no operator of its own
  test.each([
    ["OR", `"OR"*`],
    ["NEAR", `"NEAR"*`],
    ["*", `"*"*`],
    ["message:secret", `"message:secret"*`],
    [`a"OR"b`, `"a""OR""b"*`],
  ])("matches %s literally", (query, expected) => {
    expect.hasAssertions();

    expect(getSearchExpression(query)).toBe(expected);
  });
});
