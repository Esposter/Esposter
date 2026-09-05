import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
// @vitest-environment nuxt
import type { VueWrapper } from "@vue/test-utils";

import { BooleanFormat } from "#shared/models/resource/sheet/column/BooleanFormat";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { NumberFormat } from "#shared/models/resource/sheet/column/NumberFormat";
import { USD_CURRENCY_FORMATTER } from "#shared/services/intl/constants";
import ResourceSheetRowTable from "@/components/Resource/Sheet/Row/Table.vue";
import { createBooleanColumn } from "@/composables/resource/sheet/commands/createBooleanColumn.test";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createComputedColumn } from "@/composables/resource/sheet/commands/createComputedColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createNumberColumn } from "@/composables/resource/sheet/commands/createNumberColumn.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { toColumnKey } from "@/services/resource/sheet/column/toColumnKey";
import { useFilterStore } from "@/store/resource/sheet/filter";
import { useRowStore } from "@/store/resource/sheet/row";
import { useRowDialogStore } from "@/store/resource/sheet/rowDialog";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test } from "vitest";

describe("resourceSheetRowTable", () => {
  let wrapper: VueWrapper;
  const name = "name";

  const mountWithDataSource = async (dataSource: DataSource) => {
    wrapper = await mountSuspended(ResourceSheetRowTable, { props: { dataSource } });
    setupWithDataSource(dataSource);
    await nextTick();
    return useRowStore();
  };

  // The select, drag and row-number columns are drawn before the first column of the data source
  const firstDataColumnIndex = 4;
  const getCellTexts = (columnIndex = firstDataColumnIndex) =>
    wrapper.findAll(`tbody tr td:nth-child(${columnIndex})`).map((cell) => cell.text());

  afterEach(() => {
    wrapper?.unmount();
    // The sheet stores belong to the nuxt app, not to a test, so a search, sort or filter left behind would
    // Decide which rows the next test's table draws
    const rowStore = useRowStore();
    rowStore.search = "";
    rowStore.sortBy = [];
    const filterStore = useFilterStore();
    filterStore.clearColumnFilters();
  });

  // The dialog is targeted by row id, and a filter hiding the row under an open one leaves the target naming a
  // Row that is no longer on the table — the dialog then re-opens by itself the moment that row is back
  test("drops the edit target whose row leaves the filtered rows", async () => {
    expect.hasAssertions();

    const row = createRow({ [name]: "" });
    const dataSource = createDataSource([createColumn(name)], [row]);
    wrapper = await mountSuspended(ResourceSheetRowTable, { props: { dataSource }, shallow: true });
    setupWithDataSource(dataSource);
    const rowDialogStore = useRowDialogStore();
    const filterStore = useFilterStore();
    rowDialogStore.editingId = row.id;
    await nextTick();
    const editingIdWhileVisible = rowDialogStore.editingId;
    filterStore.setColumnFilter(name, { type: ColumnType.String, value: " " });
    await nextTick();

    expect(editingIdWhileVisible).toBe(row.id);
    expect(rowDialogStore.editingId).toBe("");
  });

  test("renders a cell through its column's format", async () => {
    expect.hasAssertions();

    const column = createBooleanColumn(name);
    column.format = BooleanFormat.YesNo;
    await mountWithDataSource(createDataSource([column], [createRow({ [name]: true })]));

    expect(getCellTexts()).toStrictEqual(["Yes"]);
  });

  // A computed column keeps nothing in `row.data`, so a cell that reads the row instead of computing it comes
  // Out blank — the display path has to resolve the value the same way the rest of the grid does
  test("renders a computed cell from its transformation", async () => {
    expect.hasAssertions();

    const sourceColumn = createNumberColumn(name);
    const computedColumn = createComputedColumn("computed", sourceColumn.id);
    await mountWithDataSource(createDataSource([sourceColumn, computedColumn], [createRow({ [name]: 1234 })]));

    expect(getCellTexts(firstDataColumnIndex + 1)).toStrictEqual(["1234"]);
  });

  // What a reader sees is the formatted text, so that is what the search box has to match — matching the
  // Underlying value instead makes a search for the cell that is on screen come back empty
  test("keeps the row whose displayed text matches the search", async () => {
    expect.hasAssertions();

    const column = createBooleanColumn(name);
    column.format = BooleanFormat.YesNo;
    const rowStore = await mountWithDataSource(
      createDataSource([column], [createRow({ [name]: true }), createRow({ [name]: false })]),
    );
    rowStore.search = "Yes";
    await nextTick();

    expect(getCellTexts()).toStrictEqual(["Yes"]);
  });

  // Sorting deliberately does not follow the formatted text the way search does — "$10.00" sorts ahead of
  // "$9.00" as text, while a spreadsheet orders the column by the numbers behind it
  test("sorts by the underlying number rather than the formatted text", async () => {
    expect.hasAssertions();

    const column = createNumberColumn(name);
    column.format = NumberFormat.Currency;
    const rowStore = await mountWithDataSource(
      createDataSource([column], [createRow({ [name]: 10 }), createRow({ [name]: 9 })]),
    );
    rowStore.sortBy = [{ key: toColumnKey(name), order: "asc" }];
    await nextTick();

    expect(getCellTexts()).toStrictEqual([USD_CURRENCY_FORMATTER.format(9), USD_CURRENCY_FORMATTER.format(10)]);
  });
});
