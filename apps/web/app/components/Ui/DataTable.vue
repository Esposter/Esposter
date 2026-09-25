<script setup lang="ts" generic="T extends { id: string }, TSortKey extends string">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { UiDataTableCell } from "@/models/ui/UiDataTableCell";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { useGridKeyboard } from "@/composables/ui/useGridKeyboard";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDataTableDensity } from "@/models/ui/UiDataTableDensity";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import {
  DATA_TABLE_SKELETON_ROW_COUNT,
  MAX_DATA_TABLE_COLUMN_WIDTH,
  MIN_DATA_TABLE_COLUMN_WIDTH,
} from "@/services/ui/constants";
import { getNextGridCellPosition } from "@/services/ui/getNextGridCellPosition";

interface Props {
  columns: UiDataTableColumn<T, TSortKey>[];
  // Anything a cell takes beside what the table gives it, such as the handlers that select a range of cells
  getCellProps?: (column: UiDataTableColumn<T, TSortKey>, item: T) => Record<string, unknown>;
  // Anything a column's header cell takes, such as the props that open the column's context menu
  getHeaderProps?: (column: UiDataTableColumn<T, TSortKey>) => Record<string, unknown>;
  // What a row is called, which names the checkbox that selects it
  getItemTitle: (item: T) => string;
  // Anything a row takes beside what the table gives it, such as the props that open its context menu
  getRowProps?: (item: T) => Record<string, unknown>;
  // Rows with the same value here are drawn under one header that opens and closes them
  groupBy?: keyof T & string;
  // Its cells are walked as a spreadsheet's are, the WAI-ARIA grid: one stop in the tab order on the active cell, the
  // Arrows, Home and End, Page Up and Page Down moving it, and Enter handing it to `onEditCell`. Any other chord is left
  // To the commands the page registers, so a surface's own keys stay on top of the grid's
  isCellNavigable?: true;
  // The first column stays at the start while the rest scroll under it, with a shade along its edge once they do, so
  // A row's name stays in view beside its far columns
  isFirstColumnSticky?: true;
  // A header adds its column to the order rather than replacing it, as a spreadsheet sorts by one column then another
  isMultiSort?: true;
  isPending?: boolean;
  // Each header carries a handle on its end edge that drags or steps its column's width
  isResizable?: true;
  isSelectable?: true;
  // The page the server read, or every row where the table has them all
  items: T[];
  // How many rows there are across every page, which the server counts. Without it the table has every row and
  // Searches, sorts and pages them itself
  itemsLength?: number;
  // The page sizes the reader picks from, -1 for every row; without them every row shows and there is no footer
  itemsPerPageOptions?: number[];
  // The table's accessible name
  label: string;
  // What Enter does to a grid's active cell: opens its editor
  onEditCell?: (column: UiDataTableColumn<T, TSortKey>, item: T) => void;
  // Where a row goes when it is clicked or takes Enter. A prop rather than an emit, so a table whose rows go nowhere,
  // Such as the recycle bin's, never draws them as something to press
  onOpen?: (item: T) => void;
  // What a table that has every row shows of them: those with a cell whose text holds it
  search?: string;
}

// A page of rows the server reads: the page, its size, the order and which rows are selected are the call site's
// Models, so it reads the page they describe and can keep them in the address. A row opens by a click or Enter where it
// Has somewhere to go, stays one stop in the tab order either way so the menu key reaches its context menu, and a
// Selection outlives the page it was made on
const page = defineModel<number>("page", { default: 1 });
const itemsPerPage = defineModel<number>("itemsPerPage", { default: -1 });
const sortBy = defineModel<SortItem<TSortKey>[]>("sortBy", { default: () => [] });
const selectedIds = defineModel<string[]>("selectedIds", { default: () => [] });
// Each column's width by its key, a column without one sized by its content, so a call site keeps what the reader
// Dragged: a sheet in its settings, a list in the address
const columnKeyWidthMap = defineModel<Record<string, number>>("columnKeyWidthMap", { default: () => ({}) });
const density = defineModel<UiDataTableDensity>("density", { default: UiDataTableDensity.Comfortable });
// The cell a grid's tab stop is on, the first while there is none or it is not drawn
const activeCell = defineModel<UiDataTableCell>("activeCell");
const {
  columns,
  getCellProps,
  getHeaderProps,
  getItemTitle,
  getRowProps,
  groupBy,
  isCellNavigable,
  isFirstColumnSticky,
  isMultiSort,
  isPending = false,
  isResizable,
  isSelectable,
  items,
  itemsLength,
  itemsPerPageOptions,
  label,
  onEditCell,
  onOpen,
  search = "",
} = defineProps<Props>();
defineSlots<{
  cell?: (props: { column: UiDataTableColumn<T, TSortKey>; item: T; value: string }) => VNode;
  empty?: () => VNode;
  // A row under the rows, a cell per column: a sum or a mean
  foot?: (props: { column: UiDataTableColumn<T, TSortKey> }) => VNode;
  group?: (props: { items: T[] }) => VNode;
  // What a header holds under its title, such as the filter of its column
  header?: (props: { column: UiDataTableColumn<T, TSortKey> }) => VNode;
}>();
// What a cell shows when the call site draws nothing there: its column's own reading, or the item's field
const getCellValue = (column: UiDataTableColumn<T, TSortKey>, item: T) =>
  column.getValue?.(item) ?? String(Reflect.get(item, column.key) ?? "");
const searchedItems = computed(() => {
  if (itemsLength !== undefined || !search) return items;
  const lowerCaseSearch = search.toLocaleLowerCase();
  return items.filter((item) =>
    columns.some((column) => getCellValue(column, item).toLocaleLowerCase().includes(lowerCaseSearch)),
  );
});
const sortedItems = computed(() => {
  if (itemsLength !== undefined || sortBy.value.length === 0) return searchedItems.value;
  const comparators = sortBy.value.flatMap(({ key, order }) => {
    const column = columns.find((candidateColumn) => candidateColumn.key === key);
    if (!column) return [];
    const compare =
      column.compare ??
      ((firstItem: T, secondItem: T) =>
        getCellValue(column, firstItem).localeCompare(getCellValue(column, secondItem), undefined, { numeric: true }));
    const direction = order === SortOrder.Desc ? -1 : 1;
    return [(firstItem: T, secondItem: T) => compare(firstItem, secondItem) * direction];
  });
  return searchedItems.value.toSorted((firstItem, secondItem) => {
    for (const compare of comparators) {
      const result = compare(firstItem, secondItem);
      if (result !== 0) return result;
    }
    return 0;
  });
});
// The rows drawn: the server's page as it came, or this page of every row
const pageItems = computed(() => {
  if (itemsLength !== undefined || itemsPerPage.value === -1) return sortedItems.value;
  const start = (page.value - 1) * itemsPerPage.value;
  return sortedItems.value.slice(start, start + itemsPerPage.value);
});
const totalLength = computed(() => itemsLength ?? sortedItems.value.length);
const columnCount = computed(() => columns.length + (isSelectable ? 1 : 0));
const pageCount = computed(() =>
  itemsPerPage.value === -1 ? 1 : Math.max(1, Math.ceil(totalLength.value / itemsPerPage.value)),
);
// A removal can leave the reader past the last page, so it steps back to it rather than show a false empty state. A
// Count of none is the one before the first read too, which must leave a page from the address alone
watch(totalLength, (newTotalLength) => {
  if (newTotalLength > 0 && page.value > pageCount.value) page.value = pageCount.value;
});
const rangeText = computed(() => {
  if (totalLength.value === 0) return "0 of 0";
  else if (itemsPerPage.value === -1) return `1–${totalLength.value} of ${totalLength.value}`;
  const start = (page.value - 1) * itemsPerPage.value + 1;
  const stop = Math.min(page.value * itemsPerPage.value, totalLength.value);
  return `${start}–${stop} of ${totalLength.value}`;
});
const itemsPerPageValue = computed({
  get: () => String(itemsPerPage.value),
  set: (value) => {
    itemsPerPage.value = Number(value);
    page.value = 1;
  },
});
const pageIds = computed(() => pageItems.value.map(({ id }) => id));
const selectedPageIdCount = computed(() => pageIds.value.filter((id) => selectedIds.value.includes(id)).length);
const isPageSelected = computed(() => pageIds.value.length > 0 && selectedPageIdCount.value === pageIds.value.length);
// Without a group every row sits under one that has no header
const groups = computed(() => {
  if (!groupBy) return [{ items: pageItems.value, value: undefined }];
  const groupMap = Map.groupBy(pageItems.value, (item): unknown => item[groupBy]);
  return Array.from(groupMap, ([value, groupItems]) => ({ items: groupItems, value }));
});
const closedGroupValues = ref(new Set<unknown>());
const itemsPerPageItems = computed(() =>
  (itemsPerPageOptions ?? []).map((option) => ({
    meaning: UiIconMeaning.Rows,
    title: option === -1 ? "All" : String(option),
    value: String(option),
  })),
);
// A search changes which rows there are, so the reader starts again from the first of them
watch(
  () => search,
  () => {
    page.value = 1;
  },
);
const getSortOrder = (key: string) => sortBy.value.find((sortItem) => sortItem.key === key)?.order;
const getAriaSort = (key: string) => {
  const order = getSortOrder(key);
  if (order === SortOrder.Asc) return "ascending";
  else if (order === SortOrder.Desc) return "descending";
  else return undefined;
};
// Ascending, then descending, then the rows' own order, as a table's header cycles. A multi-sort keeps every other
// Column it sorts by where it was in the order
const toggleSort = (key: TSortKey) => {
  const order = getSortOrder(key);
  const otherSortItems = isMultiSort ? sortBy.value.filter((sortItem) => sortItem.key !== key) : [];
  if (!order) sortBy.value = [...otherSortItems, { key, order: SortOrder.Asc }];
  else if (order === SortOrder.Asc)
    sortBy.value = isMultiSort
      ? sortBy.value.map((sortItem) => (sortItem.key === key ? { key, order: SortOrder.Desc } : sortItem))
      : [{ key, order: SortOrder.Desc }];
  else sortBy.value = otherSortItems;
  page.value = 1;
};
const toggleSelection = (id: string) => {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedIds.value, id];
};
const togglePageSelection = () => {
  selectedIds.value = isPageSelected.value
    ? selectedIds.value.filter((id) => !pageIds.value.includes(id))
    : [...new Set([...selectedIds.value, ...pageIds.value])];
};
const toggleGroup = (value: unknown) => {
  const newClosedGroupValues = new Set(closedGroupValues.value);
  if (newClosedGroupValues.has(value)) newClosedGroupValues.delete(value);
  else newClosedGroupValues.add(value);
  closedGroupValues.value = newClosedGroupValues;
};
const scrollContainer = useTemplateRef("scrollContainer");
// Whether any column has scrolled under a sticky first one, which is when its edge is shaded
const { arrivedState } = useScroll(scrollContainer);
// A sticky first column sits past the selection column, which sticks beside it, so it starts where that one ends
const selectionHeaderCell = useTemplateRef("selectionHeaderCell");
const { width: selectionColumnWidth } = useElementSize(selectionHeaderCell, undefined, { box: "border-box" });
// A column the reader has not sized yet is as wide as its content, which its handle starts a drag or a step from
const headerCells = useTemplateRef("headerCells");
const measuredColumnKeyWidthMap = ref<Record<string, number>>({});
useResizeObserver(
  () => (isResizable ? (headerCells.value ?? []) : []),
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
// The rows a grid walks, those drawn, in the order they are drawn
const navigableItems = computed(() =>
  groups.value.flatMap((group) => (closedGroupValues.value.has(group.value) ? [] : group.items)),
);
const navigableItemIdIndexMap = computed(() => new Map(navigableItems.value.map(({ id }, index) => [id, index])));
// The one cell a tab lands on: the active one while it is drawn, otherwise the first
const tabStopCell = computed(() => {
  if (
    activeCell.value &&
    navigableItemIdIndexMap.value.has(activeCell.value.itemId) &&
    columns.some(({ key }) => key === activeCell.value?.columnKey)
  )
    return activeCell.value;
  const firstItem = navigableItems.value.at(0);
  const firstColumn = columns.at(0);
  return firstItem && firstColumn ? { columnKey: firstColumn.key, itemId: firstItem.id } : undefined;
});
const onGridKeydown = useGridKeyboard({
  // A row's id and a column's key are the page's own, so each is escaped before it goes into a selector
  getCellSelector: ({ columnKey, itemId }) =>
    `[role="gridcell"][data-item-id="${CSS.escape(itemId)}"][data-column-key="${CSS.escape(columnKey)}"]`,
  getFocusedCell: () => tabStopCell.value,
  getNextCell: (event, { columnKey, itemId }) => {
    const nextPosition = getNextGridCellPosition(
      event,
      {
        columnIndex: columns.findIndex(({ key }) => key === columnKey),
        rowIndex: navigableItemIdIndexMap.value.get(itemId) ?? 0,
      },
      { columnCount: columns.length, rowCount: navigableItems.value.length },
    );
    if (!nextPosition) return undefined;
    const nextItem = navigableItems.value.at(nextPosition.rowIndex);
    const nextColumn = columns.at(nextPosition.columnIndex);
    return nextItem && nextColumn ? { columnKey: nextColumn.key, itemId: nextItem.id } : undefined;
  },
  root: scrollContainer,
  setFocusedCell: (cell) => {
    activeCell.value = cell;
  },
});
</script>

<template>
  <div flex flex-col min-h-0>
    <div ref="scrollContainer" flex-1 min-h-0 of-auto>
      <table
        class="table"
        :aria-busy="isPending"
        :aria-label="label"
        :data-density="density"
        :data-scrolled="(isFirstColumnSticky && !arrivedState.left) || undefined"
        :role="isCellNavigable ? 'grid' : undefined"
        :style="{ '--data-table-selection-width': `${selectionColumnWidth}px` }"
        w-full
        @keydown="
          (event: KeyboardEvent) => {
            if (isCellNavigable) onGridKeydown(event);
          }
        "
      >
        <thead>
          <tr>
            <th
              v-if="isSelectable"
              ref="selectionHeaderCell"
              class="header cell selection"
              :class="{ pinned: isFirstColumnSticky }"
              px-3
              w-0
            >
              <UiCheckbox
                :is-mixed="selectedPageIdCount > 0 && !isPageSelected"
                label="Select this page"
                :model-value="isPageSelected"
                @update:model-value="togglePageSelection()"
              />
            </th>
            <th
              v-for="(column, columnIndex) of columns"
              :key="column.key"
              ref="headerCells"
              class="header cell"
              :class="{ 'pinned pinned-edge': isFirstColumnSticky && columnIndex === 0 }"
              :aria-sort="getAriaSort(column.key)"
              :data-column-key="column.key"
              :style="columnKeyWidthMap[column.key] ? { width: `${columnKeyWidthMap[column.key]}px` } : undefined"
              :="getHeaderProps?.(column)"
              text-muted
              px-3
              text-left
              text-nowrap
            >
              <button
                v-if="column.isSortable !== false"
                type="button"
                flex
                gap-1
                cursor-pointer
                items-center
                hover:text-text
                @click="toggleSort(column.key)"
              >
                {{ column.title }}
                <UiIcon
                  v-if="getSortOrder(column.key)"
                  :meaning="
                    getSortOrder(column.key) === SortOrder.Asc
                      ? UiIconMeaning.SortAscending
                      : UiIconMeaning.SortDescending
                  "
                />
              </button>
              <template v-else>{{ column.title }}</template>
              <slot name="header" :column />
              <UiResizeHandle
                v-if="isResizable"
                :label="`Resize ${column.title || column.key}`"
                :max="MAX_DATA_TABLE_COLUMN_WIDTH"
                :min="MIN_DATA_TABLE_COLUMN_WIDTH"
                :model-value="getColumnWidth(column.key)"
                @update:model-value="(width) => (columnKeyWidthMap = { ...columnKeyWidthMap, [column.key]: width })"
              />
            </th>
          </tr>
        </thead>
        <tbody v-if="isPending && pageItems.length === 0">
          <!-- The rows' own shape under the real header: a box where a checkbox goes and a line of text in each column -->
          <tr v-for="index of DATA_TABLE_SKELETON_ROW_COUNT" :key="index">
            <td v-if="isSelectable" class="cell selection" px-3>
              <UiSkeleton size-6 />
            </td>
            <td v-for="{ key } of columns" :key class="cell" px-3>
              <UiSkeleton h-4 w="2/3" />
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="pageItems.length === 0">
          <tr>
            <td :colspan="columnCount">
              <slot name="empty" />
            </td>
          </tr>
        </tbody>
        <template v-else>
          <tbody v-for="group of groups" :key="String(group.value)">
            <tr v-if="groupBy">
              <td class="cell" :colspan="columnCount" px-3>
                <button
                  :aria-expanded="!closedGroupValues.has(group.value)"
                  type="button"
                  flex
                  gap-2
                  cursor-pointer
                  items-center
                  @click="toggleGroup(group.value)"
                >
                  <UiIcon
                    class="chevron"
                    :data-open="!closedGroupValues.has(group.value) || undefined"
                    :meaning="UiIconMeaning.Disclosure"
                  />
                  <slot name="group" :items="group.items" />
                </button>
              </td>
            </tr>
            <template v-if="!closedGroupValues.has(group.value)">
              <tr
                v-for="item of group.items"
                :key="item.id"
                class="row"
                :data-selected="selectedIds.includes(item.id) || undefined"
                :="getRowProps?.(item)"
                :class="{ 'cursor-pointer': onOpen }"
                :tabindex="isCellNavigable ? undefined : 0"
                focus-visible:outline-hidden
                hover:bg="[color-mix(in_srgb,var(--ui-tint)_10%,transparent)]"
                focus-visible:bg="[color-mix(in_srgb,var(--ui-tint)_20%,transparent)]"
                @click="onOpen?.(item)"
                @keydown.enter.self="onOpen?.(item)"
              >
                <td
                  v-if="isSelectable"
                  class="cell selection"
                  :class="{ pinned: isFirstColumnSticky }"
                  px-3
                  @click.stop
                >
                  <UiCheckbox
                    :label="`Select ${getItemTitle(item)}`"
                    :model-value="selectedIds.includes(item.id)"
                    @update:model-value="toggleSelection(item.id)"
                  />
                </td>
                <td
                  v-for="(column, columnIndex) of columns"
                  :key="column.key"
                  class="cell"
                  :class="{ 'pinned pinned-edge': isFirstColumnSticky && columnIndex === 0 }"
                  :data-column-key="isCellNavigable ? column.key : undefined"
                  :data-item-id="isCellNavigable ? item.id : undefined"
                  :role="isCellNavigable ? 'gridcell' : undefined"
                  :tabindex="
                    isCellNavigable
                      ? tabStopCell?.itemId === item.id && tabStopCell.columnKey === column.key
                        ? 0
                        : -1
                      : undefined
                  "
                  :="getCellProps?.(column, item)"
                  px-3
                  @focus="
                    () => {
                      if (isCellNavigable && (activeCell?.itemId !== item.id || activeCell.columnKey !== column.key))
                        activeCell = { columnKey: column.key, itemId: item.id };
                    }
                  "
                  @keydown.enter.self="
                    (event: KeyboardEvent) => {
                      if (!isCellNavigable) return;
                      event.preventDefault();
                      onEditCell?.(column, item);
                    }
                  "
                >
                  <slot name="cell" :column :item :value="getCellValue(column, item)">{{
                    getCellValue(column, item)
                  }}</slot>
                </td>
              </tr>
            </template>
          </tbody>
        </template>
        <tfoot v-if="$slots.foot && pageItems.length > 0">
          <tr>
            <td v-if="isSelectable" class="cell" :class="{ pinned: isFirstColumnSticky }" />
            <td
              v-for="(column, columnIndex) of columns"
              :key="column.key"
              class="cell"
              :class="{ 'pinned pinned-edge': isFirstColumnSticky && columnIndex === 0 }"
              px-3
            >
              <slot name="foot" :column />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <footer v-if="itemsPerPageOptions" px-3 py-1 flex gap-3 ui-bar items-center justify-end>
      <div w-24>
        <UiSelect v-model="itemsPerPageValue" :items="itemsPerPageItems" label="Rows per page" />
      </div>
      <UiIconButton
        :aria-pressed="density === UiDataTableDensity.Compact"
        label="Compact rows"
        :meaning="UiIconMeaning.Collapse"
        :variant="UiButtonVariant.Quiet"
        @click="
          density = density === UiDataTableDensity.Compact ? UiDataTableDensity.Comfortable : UiDataTableDensity.Compact
        "
      />
      <span text-muted text-nowrap>{{ rangeText }}</span>
      <UiIconButton
        :disabled="page <= 1"
        label="Previous page"
        :meaning="UiIconMeaning.Previous"
        :variant="UiButtonVariant.Quiet"
        @click="page -= 1"
      />
      <UiIconButton
        :disabled="page >= pageCount"
        label="Next page"
        :meaning="UiIconMeaning.Next"
        :variant="UiButtonVariant.Quiet"
        @click="page += 1"
      />
    </footer>
  </div>
</template>

<style scoped>
/* Separate rather than collapsed, so a sticky header keeps its line and the cells' own edges scroll with them */
.table {
  border-collapse: separate;
  border-spacing: 0;
}

/* Every row sits on a divider and every column beside the next on one, so a reader follows a row across and a column
   down without a ruler */
.cell {
  box-shadow: inset 0 calc(var(--ui-border-width) * -1) 0 0 var(--ui-divider);
}

.cell + .cell {
  box-shadow:
    inset 0 calc(var(--ui-border-width) * -1) 0 0 var(--ui-divider),
    inset var(--ui-border-width) 0 0 0 var(--ui-divider);
}

/* Comfortable rows take two steps above and below their text, and compact ones half of it. A selection box is as tall as
   a padded line already, so its cell takes none and never sets the row's height */
.cell:not(.selection) {
  padding-block: calc(var(--ui-step) * 2);
}

.table[data-density="Compact"] .cell:not(.selection) {
  padding-block: var(--ui-step);
}

/* The header stays over the rows it names as they scroll under it, on a divider, sticky cells among them */
.header {
  background-color: var(--ui-background);
  position: sticky;
  top: 0;
  z-index: 2;
}

/* A sticky first column stays at the start over the columns scrolling under it, past the selection column that stays
   beside it, and above them in the header */
.pinned {
  background-color: var(--ui-background);
  inset-inline-start: 0;
  position: sticky;
  z-index: 1;
}

.pinned-edge {
  inset-inline-start: var(--data-table-selection-width);
}

.header.pinned {
  z-index: 3;
}

/* Its edge takes a shade once a column has scrolled under it, so the reader sees there is more behind it */
.pinned-edge::after {
  background-color: color-mix(in srgb, var(--ui-text) 8%, transparent);
  content: "";
  inset-block: 0;
  inset-inline-start: 100%;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  transition: opacity var(--ui-motion-short);
  width: var(--ui-step);
}

.table[data-scrolled] .pinned-edge::after {
  opacity: 1;
}

/* A sticky cell is opaque over what scrolls under it, so its row's tint is laid over it rather than showing through */
.row:hover > .pinned {
  background-image: linear-gradient(color-mix(in srgb, var(--ui-tint) 10%, transparent) 0 0);
}

.row:focus-visible > .pinned {
  background-image: linear-gradient(color-mix(in srgb, var(--ui-tint) 20%, transparent) 0 0);
}

.row[data-selected] > .pinned {
  background-image: linear-gradient(color-mix(in srgb, var(--ui-accent) 20%, transparent) 0 0);
}

/* A row is tinted as a list's row is while it is pointed at, and more while it is focused, so the one Enter opens reads
   above the one under the pointer */
.row {
  transition: background-color var(--ui-motion-short);
}

/* A selected row is marked by a block of the accent down its first edge, as a picked slot is */
.row[data-selected] {
  background-color: color-mix(in srgb, var(--ui-accent) 20%, transparent);
  box-shadow: inset var(--ui-border-width) 0 0 0 var(--ui-accent);
}

.chevron {
  transition: transform var(--ui-motion-short);
}

.chevron[data-open] {
  transform: rotate(90deg);
}
</style>
