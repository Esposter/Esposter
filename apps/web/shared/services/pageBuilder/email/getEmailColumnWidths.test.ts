import type { MjmlColumnNode } from "mjml-blocks";

import { getEmailColumnWidths } from "#shared/services/pageBuilder/email/getEmailColumnWidths";
import { MjmlNodeType } from "mjml-blocks";
import { describe, expect, test } from "vitest";

describe(getEmailColumnWidths, () => {
  const TEST_COLUMN_ID = crypto.randomUUID();
  const createColumn = (width?: string): MjmlColumnNode => ({
    props: { children: [], id: TEST_COLUMN_ID, width },
    type: MjmlNodeType.Column,
  });

  test("columns without a width split the section equally", () => {
    expect.hasAssertions();

    expect(getEmailColumnWidths([createColumn(), createColumn()])).toStrictEqual(["50%", "50%"]);
  });

  test("unset columns take no share when the set widths overshoot the section", () => {
    expect.hasAssertions();

    expect(getEmailColumnWidths([createColumn("60%"), createColumn("60%"), createColumn()])).toStrictEqual([
      "60%",
      "60%",
      "0%",
    ]);
  });

  test("a column's own percentage is kept and the unset columns split what it leaves", () => {
    expect.hasAssertions();

    expect(getEmailColumnWidths([createColumn("30%"), createColumn(), createColumn()])).toStrictEqual([
      "30%",
      "35%",
      "35%",
    ]);
  });

  test("unset columns take no width when the set percentages already fill the section", () => {
    expect.hasAssertions();

    expect(getEmailColumnWidths([createColumn("60%"), createColumn("60%"), createColumn()])).toStrictEqual([
      "60%",
      "60%",
      "0%",
    ]);
  });

  test("a pixel width is kept and takes none of the share", () => {
    expect.hasAssertions();

    expect(getEmailColumnWidths([createColumn("200px"), createColumn()])).toStrictEqual(["200px", "100%"]);
  });
});
