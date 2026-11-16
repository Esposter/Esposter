import type { UiDataTableCell } from "#src/models/ui/UiDataTableCell";
import type { UiDataTableColumn } from "#src/models/ui/UiDataTableColumn";

import { getNextGridCellPosition } from "#src/services/ui/getNextGridCellPosition";

// The cells of a data table as one grid with one tab stop: the stop is the active cell while the table draws it and
// Otherwise the first, and each key the grid maps moves it to another cell the table draws, in the order they are drawn
export const useDataTableGrid = <T extends { id: string }, TSortKey extends string>(
  activeCell: Ref<UiDataTableCell | undefined>,
  columns: MaybeRefOrGetter<UiDataTableColumn<T, TSortKey>[]>,
  navigableItems: MaybeRefOrGetter<T[]>,
  root: Readonly<ShallowRef<HTMLElement | null>>,
) => {
  const navigableItemIdIndexMap = computed(() => new Map(toValue(navigableItems).map(({ id }, index) => [id, index])));
  // The one cell a tab lands on: the active one while it is drawn, otherwise the first
  const tabStopCell = computed(() => {
    const columnValues = toValue(columns);
    if (
      activeCell.value &&
      navigableItemIdIndexMap.value.has(activeCell.value.itemId) &&
      columnValues.some(({ key }) => key === activeCell.value?.columnKey)
    )
      return activeCell.value;
    const firstItem = toValue(navigableItems).at(0);
    const firstColumn = columnValues.at(0);
    return firstItem && firstColumn ? { columnKey: firstColumn.key, itemId: firstItem.id } : undefined;
  });
  const onGridKeydown = useGridKeyboard({
    // A row's id and a column's key are the page's own, so each is escaped before it goes into a selector
    getCellSelector: ({ columnKey, itemId }) =>
      `[role="gridcell"][data-item-id="${CSS.escape(itemId)}"][data-column-key="${CSS.escape(columnKey)}"]`,
    getFocusedCell: () => tabStopCell.value,
    getNextCell: (event, { columnKey, itemId }) => {
      const columnValues = toValue(columns);
      const rowItems = toValue(navigableItems);
      const nextPosition = getNextGridCellPosition(
        event,
        {
          columnIndex: columnValues.findIndex(({ key }) => key === columnKey),
          rowIndex: navigableItemIdIndexMap.value.get(itemId) ?? 0,
        },
        { columnCount: columnValues.length, rowCount: rowItems.length },
      );
      if (!nextPosition) return undefined;
      const nextItem = rowItems.at(nextPosition.rowIndex);
      const nextColumn = columnValues.at(nextPosition.columnIndex);
      return nextItem && nextColumn ? { columnKey: nextColumn.key, itemId: nextItem.id } : undefined;
    },
    root,
    setFocusedCell: (cell) => {
      activeCell.value = cell;
    },
  });
  return { onGridKeydown, tabStopCell };
};
