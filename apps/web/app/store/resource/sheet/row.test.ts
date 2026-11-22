// @vitest-environment nuxt
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createComputedColumn } from "#shared/models/resource/sheet/column/createComputedColumn.test";
import { createNumberColumn } from "#shared/models/resource/sheet/column/createNumberColumn.test";
import { AggregationTransformationType } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { useResourceStore } from "#src/store/resource/index";
import { useFilterStore } from "#src/store/resource/sheet/filter";
import { useSheetStore } from "#src/store/resource/sheet/index";
import { useRowStore } from "#src/store/resource/sheet/row";
import { SortOrder } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";

describe(useRowStore, () => {
  setupCommandTest();

  // The store outlives the sheet, so held once for the app every sheet opened after the first would open on its
  // Page, searched and sorted by its terms, with its row ids selected
  test("keeps a sheet's page, search, sort and selected rows to that sheet", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const resourceStore = useResourceStore();
    const { applyResource } = resourceStore;
    const rowStore = useRowStore();
    const { page, search, selectedRowIds, sortBy } = storeToRefs(rowStore);
    page.value = 2;
    search.value = " ";
    selectedRowIds.value = [""];
    sortBy.value = [{ key: "", order: SortOrder.Asc }];
    applyResource(createResourceListItem(), null, null);

    expect({
      page: page.value,
      search: search.value,
      selectedRowIds: selectedRowIds.value,
      sortBy: sortBy.value,
    }).toStrictEqual({ page: 1, search: "", selectedRowIds: [], sortBy: [] });
  });

  // A new filter starts the rows over, but a sheet opened again brings its own filters back, and the page it was on
  // With them
  test("keeps a sheet's page when it is opened again after a sheet with other filters", async () => {
    expect.hasAssertions();

    setupWithDataSource(createDataSource([createColumn("")], []));
    const resourceStore = useResourceStore();
    const { resource } = storeToRefs(resourceStore);
    const { applyResource } = resourceStore;
    const firstResource = resource.value;
    assert.exists(firstResource);
    const filterStore = useFilterStore();
    const { setColumnFilter } = filterStore;
    const rowStore = useRowStore();
    const { page } = storeToRefs(rowStore);
    page.value = 2;
    applyResource(createResourceListItem(), null, null);
    setColumnFilter("", { type: ColumnType.String, value: "value" });
    await flushPromises();
    applyResource(firstResource, null, null);
    await flushPromises();

    expect(page.value).toBe(2);
  });

  // The open sheet's columns are rebuilt when its content is read again — a restore, or another device's save — and
  // That rebuilds the derived column filters without any filter having changed, so the page it was on has to stay
  test("keeps a sheet's page when its content is read again", async () => {
    expect.hasAssertions();

    setupWithDataSource(createDataSource([createColumn("")], []));
    const sheetStore = useSheetStore();
    const { sheetResource } = storeToRefs(sheetStore);
    const rowStore = useRowStore();
    const { page } = storeToRefs(rowStore);
    page.value = 2;
    sheetResource.value.data = createDataSource([createColumn("")], []);
    await flushPromises();

    expect(page.value).toBe(2);
  });

  // An aggregation keeps nothing in its row, so its cell follows its source's cells: an edit to one of them has to
  // Reach the text the row shows
  test("an aggregation's cell text follows an edit to its source cell", () => {
    expect.hasAssertions();

    const sourceColumn = createNumberColumn("");
    const runningSummationColumn = createComputedColumn(" ", sourceColumn.id, {
      aggregationTransformationType: AggregationTransformationType.RunningSummation,
      sourceColumnId: sourceColumn.id,
      type: ColumnTransformationType.Aggregation,
    });
    setupWithDataSource(
      createDataSource([sourceColumn, runningSummationColumn], [createRow({ "": 1 }), createRow({ "": 2 })]),
    );
    const sheetStore = useSheetStore();
    const { dataSource } = storeToRefs(sheetStore);
    const rowStore = useRowStore();
    const { getCellText } = rowStore;
    const lastRow = takeOne(dataSource.value.rows, 1);

    expect(getCellText(lastRow, runningSummationColumn)).toBe("3");

    takeOne(dataSource.value.rows).data[""] = 5;

    expect(getCellText(lastRow, runningSummationColumn)).toBe("7");
  });
});
