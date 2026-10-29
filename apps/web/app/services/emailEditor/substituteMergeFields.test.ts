import { substituteMergeFields } from "@/services/emailEditor/substituteMergeFields";
import { describe, expect, test } from "vitest";

describe(substituteMergeFields, () => {
  const columnName = "name";

  test("substitutes all occurrences of a merge field", () => {
    expect.hasAssertions();

    expect(substituteMergeFields(`<p>{{${columnName}}}</p><p>{{${columnName}}}</p>`, { [columnName]: "a" })).toBe(
      "<p>a</p><p>a</p>",
    );
  });

  test("substitutes multiple columns", () => {
    expect.hasAssertions();

    expect(substituteMergeFields(`{{${columnName}}}{{count}}`, { [columnName]: "a", count: 1 })).toBe("a1");
  });

  test("escapes html in values", () => {
    expect.hasAssertions();

    expect(substituteMergeFields(`{{${columnName}}}`, { [columnName]: "<b>" })).toBe("&lt;b&gt;");
  });

  test("writes a value's $ patterns as text rather than expanding them", () => {
    expect.hasAssertions();

    expect(substituteMergeFields(`{{${columnName}}}`, { [columnName]: "$&" })).toBe("$&amp;");
    expect(substituteMergeFields(`{{${columnName}}}`, { [columnName]: "$$" })).toBe("$$");
  });

  test("does not expand a token that a value contains", () => {
    expect.hasAssertions();

    expect(substituteMergeFields(`{{${columnName}}}`, { [columnName]: "{{count}}", count: 1 })).toBe("{{count}}");
  });

  test("substitutes null as empty string", () => {
    expect.hasAssertions();

    expect(substituteMergeFields(`{{${columnName}}}`, { [columnName]: null })).toBe("");
  });

  test("substitutes the escaped token form for special-character column names", () => {
    expect.hasAssertions();

    expect(substituteMergeFields("{{P&amp;L}}", { "P&L": "a" })).toBe("a");
  });

  test("a column name with a quote matches the token the compile writes, which leaves quotes unescaped", () => {
    expect.hasAssertions();

    expect(substituteMergeFields("{{O'Brien}}", { "O'Brien": "a" })).toBe("a");
  });

  test("the raw form of a special-character merge field is left alone, since the compile never writes it", () => {
    expect.hasAssertions();

    expect(substituteMergeFields("{{P&L}}", { "P&L": "a" })).toBe("{{P&L}}");
  });

  test("substitutes a column whose name ends in a brace, matched whole rather than cut at its first closing braces", () => {
    expect.hasAssertions();

    expect(substituteMergeFields("{{x}}}", { "x}": "v" })).toBe("v");
  });

  test("leaves merge fields without a matching column", () => {
    expect.hasAssertions();

    expect(substituteMergeFields("{{-1}}", { [columnName]: "a" })).toBe("{{-1}}");
  });
});
