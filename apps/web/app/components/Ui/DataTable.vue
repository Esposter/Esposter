<script setup lang="ts" generic="T extends { id: string }, TSortKey extends string">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DATA_TABLE_SKELETON_ROW_COUNT } from "@/services/ui/constants";

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
  // A header adds its column to the order rather than replacing it, as a spreadsheet sorts by one column then another
  isMultiSort?: true;
  isPending?: boolean;
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
const {
  columns,
  getCellProps,
  getHeaderProps,
  getItemTitle,
  getRowProps,
  groupBy,
  isMultiSort,
  isPending = false,
  isSelectable,
  items,
  itemsLength,
  itemsPerPageOptions,
  label,
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
  const groupMap = new Map<unknown, T[]>();
  for (const item of pageItems.value) groupMap.set(item[groupBy], [...(groupMap.get(item[groupBy]) ?? []), item]);
  return Array.from(groupMap, ([value, groupItems]) => ({ items: groupItems, value }));
});
const closedGroupValues = ref(new Set<unknown>());
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
</script>

<template>
  <div flex flex-col min-h-0>
    <div flex-1 min-h-0 of-auto>
      <table :aria-busy="isPending" :aria-label="label" w-full>
        <thead>
          <tr>
            <th v-if="isSelectable" class="header" px-2 w-0>
              <UiCheckbox
                :is-mixed="selectedPageIdCount > 0 && !isPageSelected"
                label="Select this page"
                :model-value="isPageSelected"
                @update:model-value="togglePageSelection()"
              />
            </th>
            <th
              v-for="column of columns"
              :key="column.key"
              class="header"
              :aria-sort="getAriaSort(column.key)"
              :="getHeaderProps?.(column)"
              text-muted
              px-2
              py-1
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
            </th>
          </tr>
        </thead>
        <tbody v-if="isPending && pageItems.length === 0">
          <!-- The rows' own shape under the real header: a box where a checkbox goes and a line of text in each column -->
          <tr v-for="index of DATA_TABLE_SKELETON_ROW_COUNT" :key="index">
            <td v-if="isSelectable" px-2 py-1>
              <UiSkeleton size-6 />
            </td>
            <td v-for="{ key } of columns" :key px-2 py-1>
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
              <td :colspan="columnCount" px-2 py-1>
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
                tabindex="0"
                hover:bg="accent/10"
                @click="onOpen?.(item)"
                @keydown.enter.self="onOpen?.(item)"
              >
                <td v-if="isSelectable" px-2 @click.stop>
                  <UiCheckbox
                    :label="`Select ${getItemTitle(item)}`"
                    :model-value="selectedIds.includes(item.id)"
                    @update:model-value="toggleSelection(item.id)"
                  />
                </td>
                <td v-for="column of columns" :key="column.key" :="getCellProps?.(column, item)" px-2 py-1>
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
            <td v-if="isSelectable" />
            <td v-for="column of columns" :key="column.key" px-2 py-1>
              <slot name="foot" :column />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <footer v-if="itemsPerPageOptions" px-2 py-1 flex flex-wrap gap-3 items-center justify-end>
      <div w-24>
        <UiSelect
          v-model="itemsPerPageValue"
          :items="
            itemsPerPageOptions.map((option) => ({
              title: option === -1 ? 'All' : String(option),
              value: String(option),
            }))
          "
          label="Rows per page"
        />
      </div>
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
/* The header stays over the rows it names as they scroll under it, on a one-step line in the edge colour */
.header {
  background-color: var(--ui-background);
  box-shadow: inset 0 calc(var(--ui-step) * -1) 0 0 var(--ui-panel-edge);
  position: sticky;
  top: 0;
  z-index: 1;
}

/* A selected row is marked by a block of the accent down its first edge, as a picked slot is */
.row[data-selected] {
  background-color: color-mix(in srgb, var(--ui-accent) 20%, transparent);
  box-shadow: inset var(--ui-step) 0 0 0 var(--ui-accent);
}

.chevron {
  transition: transform var(--ui-motion-short);
}

.chevron[data-open] {
  transform: rotate(90deg);
}
</style>
