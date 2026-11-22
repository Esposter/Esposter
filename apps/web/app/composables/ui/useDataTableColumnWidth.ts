import { MAX_DATA_TABLE_COLUMN_WIDTH, MIN_DATA_TABLE_COLUMN_WIDTH } from "#src/services/ui/constants";

// The column widths of a data table whose headers can be dragged: a column the reader has not sized is as wide as its
// Content, measured as its header is drawn, which its handle starts a drag or a step from
export const useDataTableColumnWidth = (
  headerCells: Readonly<ShallowRef<HTMLElement[] | null>>,
  checkIsResizable: () => boolean | undefined,
  columnKeyWidthMap: Ref<Record<string, number>>,
) => {
  const measuredColumnKeyWidthMap = ref<Record<string, number>>({});
  useResizeObserver(
    () => (checkIsResizable() ? (headerCells.value ?? []) : []),
    (entries) => {
      const newMeasuredColumnKeyWidthMap = { ...measuredColumnKeyWidthMap.value };
      for (const { target } of entries)
        if (target instanceof HTMLElement && target.dataset.columnKey)
          newMeasuredColumnKeyWidthMap[target.dataset.columnKey] = target.offsetWidth;
      measuredColumnKeyWidthMap.value = newMeasuredColumnKeyWidthMap;
    },
  );
  const getColumnWidth = (key: string) =>
    columnKeyWidthMap.value[key] ??
    Math.min(
      Math.max(measuredColumnKeyWidthMap.value[key] ?? MIN_DATA_TABLE_COLUMN_WIDTH, MIN_DATA_TABLE_COLUMN_WIDTH),
      MAX_DATA_TABLE_COLUMN_WIDTH,
    );
  return { getColumnWidth };
};
