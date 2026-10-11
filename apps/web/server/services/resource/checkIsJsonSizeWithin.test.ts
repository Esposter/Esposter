import { checkIsJsonSizeWithin } from "#server/services/resource/checkIsJsonSizeWithin";
import { describe, expect, test } from "vitest";

describe(checkIsJsonSizeWithin, () => {
  test.each([
    ["an empty object", {}],
    ["an empty array", []],
    ["nested members", { a: [0, "", null, true, { b: [] }], c: "é\n" }],
  ])("measures %s as JSON.stringify writes it", (_title, value) => {
    expect.hasAssertions();

    const size = Buffer.byteLength(JSON.stringify(value));

    expect(checkIsJsonSizeWithin(value, size)).toBe(true);
    expect(checkIsJsonSizeWithin(value, size - 1)).toBe(false);
  });

  // A JSON Patch copy shares the value it copies, so copying a document into itself doubles what it serializes to with
  // Every operation; a hundred of them would never finish serializing, and the walk stops at the limit instead
  test("refuses a value whose shared subtrees expand past the limit", () => {
    expect.hasAssertions();

    const value = Array.from({ length: 100 }).reduce<unknown>((document) => ({ a: document, b: document }), {});

    expect(checkIsJsonSizeWithin(value, 1000)).toBe(false);
  });
});
