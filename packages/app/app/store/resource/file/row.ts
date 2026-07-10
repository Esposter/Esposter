import type { DataSourceItem } from "#shared/models/resource/file/datasource/DataSourceItem";
import type { Row } from "#shared/models/resource/file/datasource/Row";
import type { DataTableHeader } from "@/models/vuetify/DataTableHeader";
import type { SortItem } from "vuetify/lib/components/VDataTable/composables/sort.mjs";

import { computeValue } from "@/services/resource/file/column/computeValue";
import { toColumnKey } from "@/services/resource/file/column/toColumnKey";
import { filterDataSourceRows } from "@/services/resource/file/dataSource/filterDataSourceRows";
import { useFileStore } from "@/store/resource/file";
import { useColumnStore } from "@/store/resource/file/column";
import { useFilterStore } from "@/store/resource/file/filter";
import { useFindReplaceStore } from "@/store/resource/file/findReplace";

export const useRowStore = defineStore("resource/file/row", () => {
  const fileStore = useFileStore();
  const columnStore = useColumnStore();
  const filterStore = useFilterStore();
  const findReplaceStore = useFindReplaceStore();
  const copyIncludesHeaders = ref(true);
  const itemsPerPage = ref(10);
  const page = ref(1);
  const search = ref("");
  const sortBy = ref<readonly SortItem[]>([]);
  const selectedRowIds = ref<string[]>([]);
  const filteredRows = computed(() => filterDataSourceRows(fileStore.dataSource.rows, filterStore.columnFilters));
  const rowIndexIdMap = computed(() => new Map(filteredRows.value.map((row, index) => [row.id, index])));
  const headers = computed<DataTableHeader<Row>[]>(() => [
    { key: "data-table-select", sortable: false, title: "" },
    { key: "drag", sortable: false, title: "" },
    { key: "#", sortable: false, title: "#" },
    ...columnStore.displayColumns.map((column) => ({
      key: toColumnKey(column.name),
      title: column.name,
      value: (row: Row) =>
        computeValue(filteredRows.value, row, columnStore.columns, column, rowIndexIdMap.value.get(row.id)),
    })),
    { key: "actions", sortable: false, title: "Actions" },
  ]);
  const tableHeaders = computed(() => headers.value.filter(({ key }) => key !== "data-table-select"));

  watchDeep(
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
