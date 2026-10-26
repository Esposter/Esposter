// @vitest-environment nuxt
import type { Dataset } from "#shared/models/dataset/Dataset";

import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DatasetAggregationType } from "#shared/models/dataset/DatasetAggregationType";
import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { MimeType } from "#shared/models/file/MimeType";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { exportDashboardVisualCsv } from "@/services/dashboard/export/exportDashboardVisualCsv";
import { useAlertStore } from "@/store/alert";
import { downloadFile } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@esposter/shared"), async (importOriginal) => ({
  ...(await importOriginal()),
  downloadFile: vi.fn<typeof downloadFile>(),
}));

describe(exportDashboardVisualCsv, () => {
  const categoryColumn = "team";
  const responseColumn = "response";
  const scoreColumn = "score";
  const reference = { id: crypto.randomUUID(), type: DatasetProviderType.Sheet };
  const dataset: Dataset = {
    columns: [
      { name: categoryColumn, type: ColumnType.String },
      { name: responseColumn, type: ColumnType.String },
      { name: scoreColumn, type: ColumnType.Number },
    ],
    rows: [
      { [categoryColumn]: "North", [responseColumn]: "a", [scoreColumn]: 2 },
      { [categoryColumn]: "North", [responseColumn]: "b", [scoreColumn]: 3 },
      { [categoryColumn]: "South", [responseColumn]: "c", [scoreColumn]: 4 },
    ],
  };

  // A card has no category, so its file is the one value it draws
  test("a bound card writes its one value as one row", () => {
    expect.hasAssertions();

    const card = new Visual({
      dataset: {
        query: {
          series: [{ aggregation: DatasetAggregationType.Count, column: responseColumn }],
          xColumn: categoryColumn,
        },
        reference,
      },
      type: VisualType.Card,
    });

    exportDashboardVisualCsv(card, dataset);

    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(
      `${VisualType.Card}.csv`,
      `Count of ${responseColumn}\n3`,
      MimeType.Csv,
    );
  });

  // A bar chart's file is the grouped rows its table draws: one row per category, with a column for each series
  test("a bound bar chart writes a row per category with a column per series", () => {
    expect.hasAssertions();

    const bar = new Visual({
      dataset: {
        query: {
          series: [
            { aggregation: DatasetAggregationType.Count, column: responseColumn },
            { aggregation: DatasetAggregationType.Sum, column: scoreColumn },
          ],
          xColumn: categoryColumn,
        },
        reference,
      },
      type: VisualType.Bar,
    });

    exportDashboardVisualCsv(bar, dataset);

    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(
      `${VisualType.Bar}.csv`,
      `${categoryColumn},${responseColumn},${scoreColumn}\nNorth,2,5\nSouth,1,4`,
      MimeType.Csv,
    );
  });

  // A pie draws only its first series, so its file holds that one column rather than every series the table draws
  test("a bound pie writes a row per category with the first series only", () => {
    expect.hasAssertions();

    const pie = new Visual({
      dataset: {
        query: {
          series: [
            { aggregation: DatasetAggregationType.Count, column: responseColumn },
            { aggregation: DatasetAggregationType.Sum, column: scoreColumn },
          ],
          xColumn: categoryColumn,
        },
        reference,
      },
      type: VisualType.Pie,
    });

    exportDashboardVisualCsv(pie, dataset);

    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(
      `${VisualType.Pie}.csv`,
      `${categoryColumn},${responseColumn}\nNorth,2\nSouth,1`,
      MimeType.Csv,
    );
  });

  // A category is respondent text, so a spreadsheet must open it as text rather than run it as a formula
  test("a category typed as a formula is neutralised", () => {
    expect.hasAssertions();

    const formulaDataset: Dataset = {
      columns: [{ name: categoryColumn, type: ColumnType.String }],
      rows: [{ [categoryColumn]: "=1+1" }],
    };
    const bar = new Visual({
      dataset: {
        query: {
          series: [{ aggregation: DatasetAggregationType.Count, column: categoryColumn }],
          xColumn: categoryColumn,
        },
        reference,
      },
      type: VisualType.Bar,
    });

    exportDashboardVisualCsv(bar, formulaDataset);

    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(
      `${VisualType.Bar}.csv`,
      `${categoryColumn},${categoryColumn}\n"\t=1+1",1`,
      MimeType.Csv,
    );
  });

  // A capped read still downloads, but the alert says the file holds the rows read rather than the whole source
  test("a capped source alerts that the file is partial and still downloads", () => {
    expect.hasAssertions();

    const cappedDataset: Dataset = { ...dataset, rows: dataset.rows.slice(0, 2), totalRows: dataset.rows.length };
    const card = new Visual({
      dataset: {
        query: {
          series: [{ aggregation: DatasetAggregationType.Count, column: responseColumn }],
          xColumn: categoryColumn,
        },
        reference,
      },
      type: VisualType.Card,
    });

    exportDashboardVisualCsv(card, cappedDataset);

    const alertStore = useAlertStore();

    expect(alertStore.alerts.map(({ text, type }) => ({ text, type }))).toStrictEqual([
      { text: "Showing 2 of 3 rows", type: "warning" },
    ]);
    expect(downloadFile).toHaveBeenCalledExactlyOnceWith(
      `${VisualType.Card}.csv`,
      `Count of ${responseColumn}\n2`,
      MimeType.Csv,
    );
  });
});
