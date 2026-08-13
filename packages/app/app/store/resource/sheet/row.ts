import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import type { SortItem } from "vuetify/lib/components/VDataTable/composables/sort.mjs";

import { compareColumnValues } from "@/services/resource/sheet/column/compareColumnValues";
import { computeValue } from "@/services/resource/sheet/column/computeValue";
import { getDisplayText } from "@/services/resource/sheet/column/getDisplayText";
import { toColumnKey } from "@/services/resource/sheet/column/toColumnKey";
import { filterDataSourceRows } from "@/services/resource/sheet/dataSource/filterDataSourceRows";
import { useSheetStore } from "@/store/resource/sheet";
import { useColumnStore } from "@/store/resource/sheet/column";
import { useFilterStore } from "@/store/resource/sheet/filter";
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

export const useRowStore = defineStore("resource/sheet/row", () => {
  const sheetStore = useSheetStore();
  const columnStore = useColumnStore();
  const filterStore = useFilterStore();
  const findReplaceStore = useFindReplaceStore();
  const copyIncludesHeaders = ref(true);
  const itemsPerPage = ref(10);
  const page = ref(1);
  const search = ref("");
  const sortBy = ref<readonly SortItem[]>([]);
  const selectedRowIds = ref<string[]>([]);
  const filteredRows = computed(() => filterDataSourceRows(sheetStore.dataSource.rows, filterStore.columnFilters));
  const rowIndexIdMap = computed(() => new Map(filteredRows.value.map((row, index) => [row.id, index])));
  // A computed column keeps nothing in `row.data`, so every cell — displayed, searched or sorted — has to come
  // Through `computeValue` rather than off the row
  const getCellValue = (row: Row, column: Column): ColumnValue =>
    computeValue(filteredRows.value, row, columnStore.columns, column, rowIndexIdMap.value.get(row.id));
  const getCellText = (row: Row, column: Column): string => getDisplayText(getCellValue(row, column), column);
  const headers = computed<DataTableHeader<Row>[]>(() => [
    { key: "data-table-select", sortable: false, title: "" },
    { key: "drag", sortable: false, title: "" },
    { key: "#", sortable: false, title: "#" },
    ...columnStore.displayColumns.map((column) => ({
      key: toColumnKey(column.name),
      // The data table sorts on the underlying value, the way a spreadsheet does — the currency column's 9 has to
      // Land before its 10 instead of where the text "$10.00" would sort
      sortRaw: (firstRow: Row, secondRow: Row) =>
        compareColumnValues(getCellValue(firstRow, column), getCellValue(secondRow, column)),
      title: column.name,
      // The column's value is the text the cell paints, so the table's global search matches what is on screen
      value: (row: Row) => getCellText(row, column),
    })),
    { key: "actions", sortable: false, title: "Actions" },
  ]);
  const tableHeaders = computed(() => headers.value.filter(({ key }) => key !== "data-table-select"));

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
    copyIncludesHeaders,
    filteredRows,
    getCellText,
    headers,
    itemsPerPage,
    page,
    rowIndexIdMap,
    search,
    selectedRowIds,
    sortBy,
    tableHeaders,
  };
});
