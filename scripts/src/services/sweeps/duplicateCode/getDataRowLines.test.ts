import { getDataRowLines } from "#src/services/sweeps/duplicateCode/getDataRowLines";
import { describe, expect, test } from "vitest";

describe(getDataRowLines, () => {
  test("reads keyed number rows, hex literals and colour strings as data rows", () => {
    expect.hasAssertions();

    expect(getDataRowLines('  1: 17.165605,\n  0x1f,\n  "#63c2ff",\n  radius: 0.6557,')).toStrictEqual(
      new Set([1, 2, 3, 4]),
    );
  });

  test("reads the brackets framing a row block as data and a line of code as code", () => {
    expect.hasAssertions();

    expect(getDataRowLines('  colors: [\n    "#63c2ff",\n  ],\n  const a = makeItem();')).toStrictEqual(
      new Set([1, 2, 3]),
    );
  });
});
