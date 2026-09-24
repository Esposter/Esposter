import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { buildColumnStatisticsComputeContext } from "@/services/resource/sheet/column/buildColumnStatisticsComputeContext";
import { ColumnStatisticsDefinitionMap } from "@/services/resource/sheet/column/ColumnStatisticsDefinitionMap";
import { compareColumnValues } from "@/services/resource/sheet/column/compareColumnValues";
import { computeValue } from "@/services/resource/sheet/column/computeValue";
import { getDisplayText } from "@/services/resource/sheet/column/getDisplayText";
import { toColumnKey } from "@/services/resource/sheet/column/toColumnKey";
import { filterDataSourceRows } from "@/services/resource/sheet/dataSource/filterDataSourceRows";
import { useSheetStore } from "@/store/resource/sheet";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useFilterStore } from "@/store/resource/sheet/filter";
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";
import { takeOne } from "@esposter/shared";

export const useRowStore = defineStore("resource/sheet/row", () => {
  const sheetStore = useSheetStore();
  const columnStore = useColumnStore();
  const filterStore = useFilterStore();
  const findReplaceStore = useFindReplaceStore();
  const isCopyIncludingHeaders = ref(true);
  const itemsPerPage = ref(10);
  const page = ref(1);
  const search = ref("");
  const sortBy = ref<SortItem<string>[]>([]);
  const selectedRowIds = ref<string[]>([]);
  const filteredRows = computed(() => filterDataSourceRows(sheetStore.dataSource.rows, filterStore.columnFilters));
  const rowIdIndexMap = computed(() => new Map(filteredRows.value.map((row, index) => [row.id, index])));
  // A computed column keeps nothing in `row.data`, so every cell — displayed, searched or sorted — has to come
  // Through `computeValue` rather than off the row
  const getCellValue = (row: Row, column: Column) =>
    computeValue(filteredRows.value, row, columnStore.columns, column, rowIdIndexMap.value.get(row.id));
  const getCellText = (row: Row, column: Column) => getDisplayText(getCellValue(row, column), column);
  const tableColumns = computed<UiDataTableColumn<Row>[]>(() => [
    { isSortable: false, key: "drag", title: "" },
    { isSortable: false, key: "#", title: "#" },
    ...columnStore.displayColumns.map((column) => ({
      // The table sorts on the underlying value, the way a spreadsheet does — the currency column's 9 has to land
      // Before its 10 instead of where the text "$10.00" would sort
      compare: (firstRow: Row, secondRow: Row) =>
        compareColumnValues(getCellValue(firstRow, column), getCellValue(secondRow, column)),
      // The column's value is the text the cell paints, so the table's search matches what is on screen
      getValue: (row: Row) => getCellText(row, column),
      key: toColumnKey(column.name),
      title: column.name,
    })),
    { isSortable: false, key: "actions", title: "Actions" },
  ]);
  // The statistic a number column shows under its rows, over the rows its filters leave
  const columnKeySummaryMap = computed(() => {
    const summaryMap = new Map<string, string>();
    for (const column of columnStore.displayColumns) {
      if (column.type !== ColumnType.Number || !column.footerStatisticsKey) continue;
      const values = filteredRows.value.map((row) => takeOne(row.data, column.name));
      const context = buildColumnStatisticsComputeContext(column.type, values);
      const definition = ColumnStatisticsDefinitionMap[column.footerStatisticsKey];
      const value = definition.compute(context);
      // The key is only known at runtime, so the compiler cannot correlate this definition's `compute` output
      // With its own `format` input — the two are the same statistic by construction of the map
      summaryMap.set(toColumnKey(column.name), `${definition.title} ${definition.format(value as never, column)}`);
    }
    return summaryMap;
  });

  watch(
    () => filterStore.columnFilters,
    () => {
      page.value = 1;
    },
  );

  const navigateToCurrentOccurrence = () => {
    if (itemsPerPage.value === -1) return;
    const occurrence = findReplaceStore.occurrences.at(findReplaceStore.currentOccurrenceIndex);
    if (!occurrence) return;
    page.value = Math.floor(occurrence.rowIndex / itemsPerPage.value) + 1;
  };

  watch([itemsPerPage, () => findReplaceStore.currentOccurrenceIndex, () => findReplaceStore.occurrences], () => {
    navigateToCurrentOccurrence();
  });

  return {
    columnKeySummaryMap,
    isCopyIncludingHeaders,
    filteredRows,
    getCellText,
    itemsPerPage,
    page,
    rowIdIndexMap,
    search,
    selectedRowIds,
    sortBy,
    tableColumns,
  };
});
