<script setup lang="ts" generic="T extends string">
import type { UiListItem } from "@/models/ui/UiListItem";

import { REORDER_ANIMATION_MS, TOUCH_DRAG_DELAY_MS } from "@/services/ui/constants";
import { takeOne } from "@esposter/shared";
import { useRovingFocus } from "@vuetify/v0";
import { VueDraggable } from "vue-draggable-plus";

interface Props {
  // Anything a row takes beside what the list gives it, such as the props that open its context menu
  getRowProps?: (item: UiListItem<T>) => Record<string, unknown>;
  // Lets more than one row be selected at once, in a list that holds a selection
  isMultiple?: true;
  // Lets the rows be put in another order, by dragging a row or by Alt+Up and Alt+Down, each move within its group
  isReorderable?: true;
  items: UiListItem<T>[];
  // The list's accessible name: what its rows are
  label: string;
}
// A list of rows, one stop in the tab order: the arrows, Home, End and typeahead walk it, and Enter or Space picks the
// Focused row. Bound to a selection, it is a listbox whose rows are its options, as the listbox pattern has it: a pick
// Selects a row, or toggles it where several can be. Otherwise it is a list whose rows are links, or buttons for
// Something to do, and where the reader is marks its row as current. A row's actions sit beside it in the list, never
// Inside it, where a listbox has none, since an option holds nothing interactive
defineSlots<{
  actions?: (props: { item: UiListItem<T> }) => VNode;
  append?: (props: { item: UiListItem<T> }) => VNode;
  leading?: (props: { item: UiListItem<T> }) => VNode;
  mark?: (props: { item: UiListItem<T> }) => VNode;
  title?: (props: { item: UiListItem<T> }) => VNode;
}>();
const modelValue = defineModel<T[]>();
const { getRowProps, isMultiple, isReorderable, items, label } = defineProps<Props>();
const emit = defineEmits<{ reorder: [values: T[]]; select: [value: T, event: KeyboardEvent | MouseEvent] }>();
const listId = useId();
const getRowId = (value: T) => `${listId}-${value}`;
const { focus, focusedId, onKeydown } = useRovingFocus(
  () => items.map(({ value }) => ({ el: () => window.document.getElementById(getRowId(value)), id: value })),
  { orientation: "vertical" },
);
const typeahead = useTypeahead();
const { announce, announcement, getKeyedOrder } = useReorder();
const reducedMotion = usePreferredReducedMotion();

// Rows sharing a group sit together under its heading, in the order they come
const groups = computed(() => {
  const rowGroups: { group?: string; items: UiListItem<T>[] }[] = [];
  for (const item of items) {
    const lastRowGroup = rowGroups.at(-1);
    if (lastRowGroup && lastRowGroup.group === item.group) lastRowGroup.items.push(item);
    else rowGroups.push({ group: item.group, items: [item] });
  }
  return rowGroups;
});
// Where Tab lands: the row last focused while still listed, else the first selected or current one, or the first
const tabbableValue = computed(
  () =>
    items.find(({ value }) => value === focusedId.value)?.value ??
    items.find(({ isCurrent, value }) => (modelValue.value ? modelValue.value.includes(value) : isCurrent))?.value ??
    items[0]?.value,
);
// The whole list's order with one group's rows in their new order
const reorder = (groupIndex: number, groupValues: T[]) => {
  const values = groups.value.flatMap(({ items: groupItems }, index) =>
    index === groupIndex ? groupValues : groupItems.map(({ value: groupValue }) => groupValue),
  );
  emit("reorder", values);
};
// What a group's rows take while they drag: the group's rows, and their new order handed back as the whole list's
const getReorderProps = (groupIndex: number, groupItems: UiListItem<T>[]) => ({
  animation: reducedMotion.value === "reduce" ? 0 : REORDER_ANIMATION_MS,
  delay: TOUCH_DRAG_DELAY_MS,
  delayOnTouchOnly: true,
  ghostClass: "reorder-ghost",
  modelValue: groupItems,
  "onUpdate:modelValue": (newGroupItems: UiListItem<T>[]) => {
    reorder(
      groupIndex,
      newGroupItems.map(({ value }) => value),
    );
  },
});
const pick = (value: T, event: KeyboardEvent | MouseEvent) => {
  emit("select", value, event);
  if (!modelValue.value) return;
  else if (!isMultiple) modelValue.value = [value];
  else if (modelValue.value.includes(value))
    modelValue.value = modelValue.value.filter((selectedValue) => selectedValue !== value);
  else modelValue.value = [...modelValue.value, value];
};
const onListKeydown = async (event: KeyboardEvent) => {
  const row = event.target;
  // Only a row's own keys: the actions beside it keep theirs
  if (!(row instanceof HTMLElement)) return;
  const index = items.findIndex(({ value }) => getRowId(value) === row.id);
  if (index === -1) return;

  const groupIndex = groups.value.findIndex(({ items: groupItems }) =>
    groupItems.some(({ value }) => getRowId(value) === row.id),
  );
  const groupValues = groups.value[groupIndex]?.items.map(({ value }) => value) ?? [];
  const value = takeOne(items, index).value;
  const keyedOrder = isReorderable ? getKeyedOrder(event, groupValues, groupValues.indexOf(value)) : undefined;
  if (keyedOrder) {
    event.preventDefault();
    reorder(groupIndex, keyedOrder);
    announce(keyedOrder, value);
    // Re-rendered in its new place, the row is a moved element that lost focus on the way
    await nextTick();
    focus(value);
  } else if (event.key === "Enter" || event.key === " ") {
    // A button presses itself on either; an option and a link are pressed here
    if (row instanceof HTMLButtonElement) return;
    event.preventDefault();
    row.click();
  } else {
    const typedIndex = typeahead(
      event,
      items.map(({ title }) => title),
      index,
    );
    if (typedIndex === undefined) onKeydown(event);
    else focus(takeOne(items, typedIndex).value);
  }
};
</script>

<template>
  <div
    :aria-label="label"
    :aria-multiselectable="modelValue ? Boolean(isMultiple) : undefined"
    :role="modelValue ? 'listbox' : 'list'"
    flex
    flex-col
    @keydown="(event) => onListKeydown(event)"
  >
    <!-- A group is a list item holding a list named by its heading, or a listbox's named group; rows with none sit in a
         Wrapper assistive technology passes over -->
    <div
      v-for="({ group, items: groupItems }, index) of groups"
      :key="index"
      :aria-label="group && modelValue ? group : undefined"
      :role="group ? (modelValue ? 'group' : 'listitem') : 'none'"
    >
      <div v-if="group" aria-hidden="true" text-sm text-muted px-2 pt-2>{{ group }}</div>
      <!-- A drag moves a row within its own group, and the rest of the group moves aside for it as it goes -->
      <component
        :is="isReorderable ? VueDraggable : 'div'"
        :aria-label="group && !modelValue ? group : undefined"
        :role="group && !modelValue ? 'list' : 'none'"
        :="isReorderable ? getReorderProps(index, groupItems) : {}"
        flex
        flex-col
      >
        <UiListRow
          v-for="item of groupItems"
          :id="getRowId(item.value)"
          :key="item.value"
          :is-selected="modelValue?.includes(item.value)"
          :is-tabbable="item.value === tabbableValue"
          :item
          :row-props="getRowProps?.(item)"
          @focus="focus(item.value)"
          @select="(event) => pick(item.value, event)"
        >
          <template v-if="$slots.leading" #leading><slot name="leading" :item /></template>
          <template v-if="$slots.mark" #mark><slot name="mark" :item /></template>
          <template v-if="$slots.title" #title><slot name="title" :item /></template>
          <template v-if="$slots.append" #append><slot name="append" :item /></template>
          <template v-if="$slots.actions" #actions><slot name="actions" :item /></template>
        </UiListRow>
      </component>
    </div>
    <!-- A key's move is read out; a drop is seen where it lands -->
    <div v-if="isReorderable" aria-live="polite" sr-only>{{ announcement }}</div>
  </div>
</template>
