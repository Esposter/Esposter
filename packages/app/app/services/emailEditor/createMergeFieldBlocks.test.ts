import { createMergeFieldBlocks } from "@/services/emailEditor/createMergeFieldBlocks";
import { describe, expect, test } from "vitest";

describe(createMergeFieldBlocks, () => {
  const columnName = "name";

  test("builds one mj-text block per column carrying its merge-field token", () => {
    expect.hasAssertions();

    expect(createMergeFieldBlocks([columnName])).toStrictEqual([
      { content: `<mj-text>{{${columnName}}}</mj-text>`, id: `merge-field-${columnName}`, label: columnName },
    ]);
  });

  test("escapes the column name in the label and the token, matching what the canvas serializes", () => {
    expect.hasAssertions();

    expect(createMergeFieldBlocks(["P&L"])).toStrictEqual([
      { content: "<mj-text>{{P&amp;L}}</mj-text>", id: "merge-field-P&L", label: "P&amp;L" },
    ]);
  });

  test("builds no blocks without columns", () => {
    expect.hasAssertions();

    expect(createMergeFieldBlocks([])).toStrictEqual([]);
  });
});
