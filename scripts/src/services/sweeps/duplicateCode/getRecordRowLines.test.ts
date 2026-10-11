import { getRecordRowLines } from "#src/services/sweeps/duplicateCode/getRecordRowLines";
import { describe, expect, test } from "vitest";

describe(getRecordRowLines, () => {
  test("reads a record keyed by an enum, its rows and its closing brace as record rows", () => {
    expect.hasAssertions();

    expect(
      getRecordRowLines(
        "export const map: Record<Kind, Item[]> = {\n  [Kind.A]: [],\n  [Kind.B]: [Item.C],\n};\nconst d = 0;",
      ),
    ).toStrictEqual(new Set([1, 2, 3, 4]));
  });

  test("reads a line after the record closes as code", () => {
    expect.hasAssertions();

    expect(getRecordRowLines("export const map: Record<Kind, Item[]> = {\n};\nconst a = makeItem();")).toStrictEqual(
      new Set([1, 2]),
    );
  });
});
