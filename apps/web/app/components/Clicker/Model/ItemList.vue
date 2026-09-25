<script setup lang="ts">
import type { ClickerListItem } from "@/models/clicker/ClickerListItem";
import type { UiListItem } from "@/models/ui/UiListItem";

import { takeOne } from "@esposter/shared";

interface Props {
  items: ClickerListItem[];
  label: string;
  // Where an item's details open against its row: toward the page's middle from the side the list stands on
  positionArea: string;
}

// The store's and the inventory's rows, as Cookie Clicker's: an item's picture, its name over its price and how many
// Are owned. A row opens its item's details in the one popover the list keeps, hung off the row pressed
defineSlots<{ detail: (props: { id: string }) => VNode }>();
const { items, label, positionArea } = defineProps<Props>();
// Every row is one of the items, so its own is always found
const getItem = (id: string) =>
  takeOne(
    items,
    items.findIndex((item) => item.id === id),
  );
const listItems = computed(() =>
  items.map<UiListItem<string>>(({ id }) => ({ hasMarkSlot: true, title: id, value: id })),
);
const anchor = ref<HTMLElement>();
const selectedId = ref("");
// Resolved against the list rather than held on its own, so an item that leaves it — an upgrade just bought, which the
// Store stops listing — closes its details instead of rendering them for an id the list no longer has
const { isOpen, item: selectedItem } = useSingletonDialog(selectedId, () =>
  items.find(({ id }) => id === selectedId.value),
);
const open = (id: string) => {
  // A building and an upgrade may share a name, so a row is found by its list as well
  const row = window.document.querySelector(`[data-item-key="${label}:${id}"]`);
  if (!(row instanceof HTMLElement)) return;
  anchor.value = row;
  selectedId.value = id;
};
</script>

<template>
  <UiList
    :get-row-props="({ value }) => ({ 'data-item-key': `${label}:${value}` })"
    :items="listItems"
    :label
    select-none
    @select="open($event)"
  >
    <template #mark="{ item }">
      <NuxtImg size-6 object-contain :src="getItem(item.value).image" alt="" />
    </template>
    <template #title="{ item }">
      <ClickerModelItemListTitle :item="getItem(item.value)" />
    </template>
    <template #append="{ item }">
      <span v-if="getItem(item.value).amount" ui-title>{{ getItem(item.value).amount }}</span>
    </template>
  </UiList>
  <UiPopover v-model:is-open="isOpen" :anchor :label="selectedId" :position-area>
    <slot v-if="selectedItem" :id="selectedItem.id" name="detail" />
  </UiPopover>
</template>
