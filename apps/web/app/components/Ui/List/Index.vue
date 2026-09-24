<script setup lang="ts" generic="T extends string">
import type { UiListItem } from "@/models/ui/UiListItem";

import { takeOne } from "@esposter/shared";
import { useRovingFocus } from "@vuetify/v0";

interface Props {
  // Lets more than one row be selected at once, in a list that holds a selection
  isMultiple?: true;
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
  mark?: (props: { item: UiListItem<T> }) => VNode;
}>();
const modelValue = defineModel<T[]>();
const { isMultiple, items, label } = defineProps<Props>();
const emit = defineEmits<{ select: [value: T, event: KeyboardEvent | MouseEvent] }>();
const listId = useId();
const getRowId = (value: T) => `${listId}-${value}`;
const { focus, focusedId, onKeydown } = useRovingFocus(
  () => items.map(({ value }) => ({ el: () => window.document.getElementById(getRowId(value)), id: value })),
  { orientation: "vertical" },
);
const typeahead = useTypeahead();
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
const pick = (value: T, event: KeyboardEvent | MouseEvent) => {
  emit("select", value, event);
  if (!modelValue.value) return;
  else if (!isMultiple) modelValue.value = [value];
  else if (modelValue.value.includes(value))
    modelValue.value = modelValue.value.filter((selectedValue) => selectedValue !== value);
  else modelValue.value = [...modelValue.value, value];
};
const onListKeydown = (event: KeyboardEvent) => {
  const row = event.target;
  // Only a row's own keys: the actions beside it keep theirs
  if (!(row instanceof HTMLElement)) return;
  const index = items.findIndex(({ value }) => getRowId(value) === row.id);
  if (index === -1) return;

  if (event.key === "Enter" || event.key === " ") {
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
    @keydown="onListKeydown"
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
      <div
        :aria-label="group && !modelValue ? group : undefined"
        :role="group && !modelValue ? 'list' : 'none'"
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
          @focus="focus(item.value)"
          @select="(event) => pick(item.value, event)"
        >
          <template v-if="$slots.mark" #mark><slot name="mark" :item /></template>
          <template v-if="$slots.append" #append><slot name="append" :item /></template>
          <template v-if="$slots.actions" #actions><slot name="actions" :item /></template>
        </UiListRow>
      </div>
    </div>
  </div>
</template>
