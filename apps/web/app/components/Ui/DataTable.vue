<script setup lang="ts" generic="T extends { id: string }, TSortKey extends string">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DATA_TABLE_SKELETON_ROW_COUNT } from "@/services/ui/constants";

interface Props {
  columns: UiDataTableColumn<T, TSortKey>[];
  // What a row is called, which names the checkbox that selects it
  getItemTitle: (item: T) => string;
  // Anything a row takes beside what the table gives it, such as the props that open its context menu
  getRowProps?: (item: T) => Record<string, unknown>;
  // Rows with the same value here are drawn under one header that opens and closes them
  groupBy?: keyof T & string;
  isPending?: boolean;
  isSelectable?: true;
  items: T[];
  // How many rows there are across every page, which the server counts
  itemsLength: number;
  itemsPerPageOptions: number[];
  // The table's accessible name
  label: string;
}

// A page of rows the server reads: the page, its size, the order and which rows are selected are the call site's
// Models, so it reads the page they describe and can keep them in the address. A row opens by a click or Enter, and a
// Selection outlives the page it was made on
const page = defineModel<number>("page", { required: true });
const itemsPerPage = defineModel<number>("itemsPerPage", { required: true });
const sortBy = defineModel<SortItem<TSortKey>[]>("sortBy", { required: true });
const selectedIds = defineModel<string[]>("selectedIds", { default: () => [] });
const {
  columns,
  getItemTitle,
  getRowProps,
  groupBy,
  isPending = false,
  isSelectable,
  items,
  itemsLength,
  itemsPerPageOptions,
  label,
} = defineProps<Props>();
const emit = defineEmits<{ open: [item: T] }>();
defineSlots<{
  cell?: (props: { column: UiDataTableColumn<T, TSortKey>; item: T; value: string }) => VNode;
  empty?: () => VNode;
  group?: (props: { items: T[] }) => VNode;
}>();
const columnCount = computed(() => columns.length + (isSelectable ? 1 : 0));
const pageCount = computed(() => Math.max(1, Math.ceil(itemsLength / itemsPerPage.value)));
const rangeText = computed(() => {
  if (itemsLength === 0) return "0 of 0";
  const start = (page.value - 1) * itemsPerPage.value + 1;
  const stop = Math.min(page.value * itemsPerPage.value, itemsLength);
  return `${start}–${stop} of ${itemsLength}`;
});
const itemsPerPageValue = computed({
  get: () => String(itemsPerPage.value),
  set: (value) => {
    itemsPerPage.value = Number(value);
    page.value = 1;
  },
});
const pageIds = computed(() => items.map(({ id }) => id));
const selectedPageIdCount = computed(() => pageIds.value.filter((id) => selectedIds.value.includes(id)).length);
const isPageSelected = computed(() => pageIds.value.length > 0 && selectedPageIdCount.value === pageIds.value.length);
// Without a group every row sits under one that has no header
const groups = computed(() => {
  if (!groupBy) return [{ items, value: undefined }];
  const groupMap = new Map<unknown, T[]>();
  for (const item of items) groupMap.set(item[groupBy], [...(groupMap.get(item[groupBy]) ?? []), item]);
  return Array.from(groupMap, ([value, groupItems]) => ({ items: groupItems, value }));
});
const closedGroupValues = ref(new Set<unknown>());
const getSortOrder = (key: string) => sortBy.value.find((sortItem) => sortItem.key === key)?.order;
const getAriaSort = (key: string) => {
  const order = getSortOrder(key);
  if (order === SortOrder.Asc) return "ascending";
  else if (order === SortOrder.Desc) return "descending";
  else return undefined;
};
// Ascending, then descending, then the server's own order, as a table's header cycles
const toggleSort = (key: TSortKey) => {
  const order = getSortOrder(key);
  if (!order) sortBy.value = [{ key, order: SortOrder.Asc }];
  else if (order === SortOrder.Asc) sortBy.value = [{ key, order: SortOrder.Desc }];
  else sortBy.value = [];
  page.value = 1;
};
// What a cell shows when the call site draws nothing there: its column's own reading, or the item's field
const getCellValue = (column: UiDataTableColumn<T, TSortKey>, item: T) =>
  column.getValue?.(item) ?? String(Reflect.get(item, column.key) ?? "");
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
            </th>
          </tr>
        </thead>
        <tbody v-if="isPending && items.length === 0">
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
        <tbody v-else-if="items.length === 0">
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
                tabindex="0"
                cursor-pointer
                hover:bg="accent/10"
                @click="emit('open', item)"
                @keydown.enter.self="emit('open', item)"
              >
                <td v-if="isSelectable" px-2 @click.stop>
                  <UiCheckbox
                    :label="`Select ${getItemTitle(item)}`"
                    :model-value="selectedIds.includes(item.id)"
                    @update:model-value="toggleSelection(item.id)"
                  />
                </td>
                <td v-for="column of columns" :key="column.key" px-2 py-1>
                  <slot name="cell" :column :item :value="getCellValue(column, item)">{{
                    getCellValue(column, item)
                  }}</slot>
                </td>
              </tr>
            </template>
          </tbody>
        </template>
      </table>
    </div>
    <footer px-2 py-1 flex flex-wrap gap-3 items-center justify-end>
      <div w-24>
        <UiSelect
          v-model="itemsPerPageValue"
          :items="itemsPerPageOptions.map((option) => ({ title: String(option), value: String(option) }))"
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
