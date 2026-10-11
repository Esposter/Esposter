import { Parser } from "#src/Parser";
import { assert, describe, expect, test } from "vitest";

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

  // Issues #682 and #719: `in` finds the members every object inherits, so these children were promoted into arrays
  // Alongside a function, and a repeated one grew a result the caller never wrote
  test("keeps a child named after an inherited member as a key of its own", async () => {
    expect.hasAssertions();

    const parsedXml = await new Parser().parseStringPromise<{ root: Record<string, string[]> }>(
      "<root><constructor>1</constructor><toString>2</toString></root>",
    );

    assert.exists(parsedXml);

    // Entries rather than toStrictEqual, since a toStrictEqual over an own constructor key compares it as the type
    expect(Object.entries(parsedXml.root)).toStrictEqual([
      ["constructor", ["1"]],
      ["toString", ["2"]],
    ]);
  });

  // Issues #593 and #721: a `__proto__` child is an own key of the result and changes no prototype
  test("keeps a __proto__ child as an own key and pollutes no prototype", async () => {
    expect.hasAssertions();

    const parsedXml = await new Parser().parseStringPromise<{ root: object }>(
      "<root><__proto__><polluted>1</polluted></__proto__></root>",
    );

    assert.exists(parsedXml);

    expect(Object.keys(parsedXml.root)).toStrictEqual(["__proto__"]);
    expect(Object.hasOwn(Object.prototype, "polluted")).toBe(false);
  });

  // Issues #313, #330 and #197: the document is one root element, and the first one is the result
  test("keeps the first root element and ignores the ones after it", async () => {
    expect.hasAssertions();

    await expect(new Parser().parseStringPromise("<a/><b/>")).resolves.toStrictEqual({ a: "" });
  });

  // Issues #18, #245 and #627: a document with no root element has no object to return, so it resolves to null
  test.each(["", "   ", '<?xml version="1.0"?>'])("resolves null for %j, which has no root element", async (xml) => {
    expect.hasAssertions();

    await expect(new Parser().parseStringPromise(xml)).resolves.toBeNull();
  });
});
