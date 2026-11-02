import { decodeCsv } from "#src/services/decodeCsv";
import { describe, expect, test } from "vitest";

describe(decodeCsv, () => {
  // Text with no digit and no separator holds no cell, so it decodes to none rather than to one empty cell
  test.each([
    ["an empty text", ""],
    ["a blank text", " "],
  ])("decodes %s to no cells", (_description, text) => {
    expect.hasAssertions();

    expect(decodeCsv(text)).toStrictEqual([]);
  });
});
