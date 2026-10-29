import type { Dataset } from "#shared/models/dataset/Dataset";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createDatasetCsv } from "@/services/dataset/createDatasetCsv";
import { describe, expect, test } from "vitest";

describe(createDatasetCsv, () => {
  test("prints each column's title in place of its name", () => {
    expect.hasAssertions();

    const dataset: Dataset = {
      columns: [
        { name: "a", title: "b", type: ColumnType.String },
        { name: "rating", type: ColumnType.Number },
      ],
      rows: [{ a: "c", rating: 5 }],
    };

    expect(createDatasetCsv(dataset)).toBe("b,rating\nc,5");
  });

  test("writes a null cell as empty", () => {
    expect.hasAssertions();

    const dataset: Dataset = { columns: [{ name: "a", type: ColumnType.String }], rows: [{ a: null }] };

    expect(createDatasetCsv(dataset)).toBe("a\n");
  });

  test("quotes a cell holding the delimiter", () => {
    expect.hasAssertions();

    const dataset: Dataset = { columns: [{ name: "a", type: ColumnType.String }], rows: [{ a: "x,y" }] };

    expect(createDatasetCsv(dataset)).toBe('a\n"x,y"');
  });

  test("neutralises a cell that opens as a formula", () => {
    expect.hasAssertions();

    const dataset: Dataset = { columns: [{ name: "a", type: ColumnType.String }], rows: [{ a: "=HYPERLINK(1)" }] };

    expect(createDatasetCsv(dataset)).toBe('a\n"\t=HYPERLINK(1)"');
  });
});
