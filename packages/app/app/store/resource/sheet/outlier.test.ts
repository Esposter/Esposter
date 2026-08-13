// @vitest-environment nuxt
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { createComputedColumn } from "@/composables/resource/sheet/commands/createComputedColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { getItemId } from "@/services/resource/sheet/getItemId";
import { useOutlierStore } from "@/store/resource/sheet/outlier";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useOutlierStore, () => {
  setupCommandTest();

  // A computed column producing numbers is a number column to the reader, so it is measured against its own
  // Mean like any other. Its cells are only reachable through the resolver — row.data holds nothing for it
  test("highlights a computed column's outlier alongside the column it derives from", () => {
    expect.hasAssertions();

    const sourceColumn = createNumberColumn("");
    const computedColumn = createComputedColumn(" ", sourceColumn.id, {
      sourceColumnId: sourceColumn.id,
      targetType: ColumnType.Number,
      type: ColumnTransformationType.ConvertTo,
    });
    // Five flat values plus one spike: a lone outlier among n rows sits √(n - 1) deviations out, so six rows
    // Is the smallest set that clears the 2σ threshold
    const { dataSource } = setupWithDataSource(
      createDataSource(
        [sourceColumn, computedColumn],
        [
          createRow({ "": 0 }),
          createRow({ "": 0 }),
          createRow({ "": 0 }),
          createRow({ "": 0 }),
          createRow({ "": 0 }),
          createRow({ "": 6 }),
        ],
      ),
    );
    const outlierStore = useOutlierStore();
    const { isOutlierHighlightEnabled, outlierCells } = storeToRefs(outlierStore);
    isOutlierHighlightEnabled.value = true;
    const spikeRow = takeOne(dataSource.rows, dataSource.rows.length - 1);

    expect(outlierCells.value).toStrictEqual(new Set([getItemId(spikeRow.id, ""), getItemId(spikeRow.id, " ")]));
  });
});
