import { Parser } from "#src/Parser";
import { describe, expect, test } from "vitest";

describe(Parser, () => {
  // Sax resets its own state after a rejected parse, so an element the rejection left open would be the one the
  // Next parse on the same instance nested its root under
  test("parses a document after a rejected parse on the same instance", async () => {
    expect.hasAssertions();

    const parser = new Parser({ explicitArray: false });
    await expect(parser.parseStringPromise("<a>")).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Unclosed root tag
      Line: 0
      Column: 3
      Char: ]
    `);

    await expect(parser.parseStringPromise("<b>b</b>")).resolves.toStrictEqual({ b: "b" });
  });

  test("rejects when the input cannot be converted to a string", async () => {
    expect.hasAssertions();

    const input = {
      toString: () => {
        throw new Error("toString");
      },
    };

    await expect(new Parser().parseStringPromise(input)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: toString]`,
    );
  });
});
