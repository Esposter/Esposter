import type { Dataset } from "#shared/models/dataset/Dataset";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { datasetToDataSource } from "@/services/resource/sheet/dataSource/datasetToDataSource";
import { reconcileDataSource } from "@/services/resource/sheet/dataSource/reconcileDataSource";
import { describe, expect, test } from "vitest";

describe(reconcileDataSource, () => {
  const dataset: Dataset = { columns: [{ name: " ", type: ColumnType.String }], rows: [{ " ": " " }, { " ": " " }] };

  // The version store only deduplicates bytes that are the same, so a reimport that minted new ids stored them all
  test("keeps the replaced sheet's identities for a file imported again", () => {
    expect.hasAssertions();

    const previousDataSource = datasetToDataSource(dataset, DataSourceType.Csv, "");
    const dataSource = datasetToDataSource(
      { ...dataset, rows: [{ " ": " " }, { " ": "a" }, { " ": " " }] },
      DataSourceType.Csv,
      "",
    );
    reconcileDataSource(dataSource, structuredClone(previousDataSource));
    const [unchangedRow, changedRow, appendedRow] = dataSource.rows;
    const [previousUnchangedRow, previousChangedRow] = previousDataSource.rows;

    expect(dataSource.columns.map(({ id }) => id)).toStrictEqual(previousDataSource.columns.map(({ id }) => id));
    expect(JSON.stringify(unchangedRow)).toBe(JSON.stringify(previousUnchangedRow));
    expect(changedRow?.id).toBe(previousChangedRow?.id);
    expect(appendedRow?.id).not.toBe(previousChangedRow?.id);
  });
});
