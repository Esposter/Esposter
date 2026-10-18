<script setup lang="ts">
import type { UiTreeItem } from "@/models/ui/UiTreeItem";

import { Treeview } from "@vuetify/v0";

interface Props {
  items: UiTreeItem[];
  // The tree's accessible name: what its items are
  label: string;
}
// A tree of items, one stop in the tab order: the arrows, Home, End and Enter walk and open it as Treeview has them,
// And typing the start of a title moves to the next visible item that starts with it. Focus is the selection, so the
// Item that takes focus by any of these, or by a click, is the one the model holds
const selectedId = defineModel<string>({ required: true });
const { items, label } = defineProps<Props>();
const typeahead = useTypeahead();
// The item row an event starts at, or null when it starts outside every row
const getItemRow = (event: Event) =>
  event.target instanceof Element ? event.target.closest("[role='treeitem']") : null;
// Each item's row says its id and title on its element, so focus and typeahead read them from what is drawn
const onFocusin = (event: FocusEvent) => {
  const row = getItemRow(event);
  if (row instanceof HTMLElement && row.dataset.itemId) selectedId.value = row.dataset.itemId;
};
// Asterisk is left to Treeview, which opens every sibling of the focused item, and so is every key it handles
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "*") return;
  const row = getItemRow(event);
  if (!(event.currentTarget instanceof HTMLElement) || !(row instanceof HTMLElement)) return;
  const rows = [...event.currentTarget.querySelectorAll<HTMLElement>("[role='treeitem']")];
  const typedIndex = typeahead(
    event,
    rows.map(({ dataset }) => dataset.itemTitle || ""),
    rows.indexOf(row),
  );
  if (typedIndex !== undefined) rows[typedIndex]?.focus();
};
</script>

<template>
  <Treeview.Root :model-value="selectedId" :multiple="false">
    <Treeview.List :label @focusin="(event) => onFocusin(event)" @keydown="(event) => onKeydown(event)">
      <UiTreeItem v-for="item of items" :key="item.id" :item />
    </Treeview.List>
  </Treeview.Root>
</template>
