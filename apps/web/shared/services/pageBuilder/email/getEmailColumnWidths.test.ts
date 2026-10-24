import type { MjmlColumnNode } from "mjml-blocks";

import { MjmlNodeType } from "mjml-blocks";
import { describe, expect, test } from "vitest";

import { getEmailColumnWidths } from "./getEmailColumnWidths";

describe(getEmailColumnWidths, () => {
  const TEST_COLUMN_ID = "00000000-0000-4000-8000-000000000002";
  const createColumn = (width?: string): MjmlColumnNode => ({
    props: { id: TEST_COLUMN_ID, width },
    type: MjmlNodeType.Column,
  });

  test("columns without a width split the section equally", () => {
    expect.hasAssertions();

    expect(getEmailColumnWidths([createColumn(), createColumn()])).toStrictEqual(["50%", "50%"]);
  });

  test("a column's own percentage is kept and the unset columns split what it leaves", () => {
    expect.hasAssertions();

    expect(getEmailColumnWidths([createColumn("30%"), createColumn(), createColumn()])).toStrictEqual([
      "30%",
      "35%",
      "35%",
    ]);
  });

  test("a pixel width is kept and takes none of the share", () => {
    expect.hasAssertions();

    expect(getEmailColumnWidths([createColumn("200px"), createColumn()])).toStrictEqual(["200px", "100%"]);
  });
});
