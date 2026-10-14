import { getDataRowLines } from "#src/services/sweeps/duplicateCode/getDataRowLines";
import { describe, expect, test } from "vitest";

describe(getDataRowLines, () => {
  const FIELD_COUNT = 40;
  const MAX_ROW_PARSE_MILLISECONDS = 1000;

  test("reads keyed number rows, hex literals and colour strings as data rows", () => {
    expect.hasAssertions();

    expect(getDataRowLines('  1: 17.165605,\n  0x1f,\n  "#63c2ff",\n  radius: 0.6557,')).toStrictEqual(
      new Set([1, 2, 3, 4]),
    );
  });

  test("reads a one-line object of numeric fields as a data row", () => {
    expect.hasAssertions();

    expect(getDataRowLines("  { height: 44, width: 186, x: 108, y: 130 },\n  const a = makeItem();")).toStrictEqual(
      new Set([1]),
    );
  });

  test("reads the header of a record of primitives and the brackets framing a row block as data", () => {
    expect.hasAssertions();

    expect(
      getDataRowLines(
        'export const map: Record<number, number> = {\n  colors: [\n    "#63c2ff",\n  ],\n};\nconst a = makeItem();',
      ),
    ).toStrictEqual(new Set([1, 2, 3, 4, 5]));
  });

  test("returns within a bounded time on a long double-spaced line that never closes its object", () => {
    expect.hasAssertions();

    const line = `{ ${Array.from({ length: FIELD_COUNT }, () => "a: 1").join("  ")}`;
    const start = performance.now();
    const dataRowLines = getDataRowLines(line);

    expect(performance.now() - start).toBeLessThan(MAX_ROW_PARSE_MILLISECONDS);
    expect(dataRowLines).toStrictEqual(new Set());
  });
});
