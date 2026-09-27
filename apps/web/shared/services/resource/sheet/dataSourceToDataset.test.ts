import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createComputedColumn } from "#shared/models/resource/sheet/column/createComputedColumn.test";
import { createNumberColumn } from "#shared/models/resource/sheet/column/createNumberColumn.test";
import { AggregationTransformationType } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { dataSourceToDataset } from "#shared/services/resource/sheet/dataSourceToDataset";
import { describe, expect, test } from "vitest";

describe(dataSourceToDataset, () => {
  const name = "name";
  const computedName = "computedName";

  // A dashboard binds the dataset, so a computed column missing from it is one no chart can draw
  test("serves a computed column as its result type, aggregated over rows past the limit", () => {
    expect.hasAssertions();

    const column = createNumberColumn(name);
    const computedColumn = createComputedColumn(computedName, column.id, {
      aggregationTransformationType: AggregationTransformationType.Maximum,
      sourceColumnId: column.id,
      type: ColumnTransformationType.Aggregation,
    });
    const dataSource = createDataSource([column, computedColumn], [createRow({ [name]: 0 }), createRow({ [name]: 1 })]);

    expect(dataSourceToDataset(dataSource, 1)).toStrictEqual({
      columns: [
        { name, type: ColumnType.Number },
        { name: computedName, type: ColumnType.Number },
      ],
      rows: [{ [computedName]: 1, [name]: 0 }],
    });
  });
});
