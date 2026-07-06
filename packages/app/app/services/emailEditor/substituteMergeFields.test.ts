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

  test("substitutes null as empty string", () => {
    expect.hasAssertions();

    expect(substituteMergeFields(`{{${columnName}}}`, { [columnName]: null })).toBe("");
  });

  test("substitutes the escaped token form for special-character column names", () => {
    expect.hasAssertions();

    expect(substituteMergeFields("{{P&amp;L}}", { "P&L": "a" })).toBe("a");
  });

  test("leaves merge fields without a matching column", () => {
    expect.hasAssertions();

    expect(substituteMergeFields("{{unknown}}", { [columnName]: "a" })).toBe("{{unknown}}");
  });
});
