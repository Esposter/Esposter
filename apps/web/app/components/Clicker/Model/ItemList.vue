<script setup lang="ts" generic="T extends ClickerListItem">
import type { ClickerListItem } from "@/models/clicker/ClickerListItem";
import type { UiListItem } from "@/models/ui/UiListItem";

interface Props {
  items: T[];
  label: string;
  // Where an item's details open against its row: toward the page's middle from the side the list stands on
  positionArea: string;
}
// The store's and the inventory's rows, as Cookie Clicker's: an item's picture, its name over its price and how many
// Are owned. A row opens its item's details in the one popover the list keeps, hung off the row pressed
defineSlots<{ detail: (props: { item: T }) => VNode }>();
const { items, label, positionArea } = defineProps<Props>();
// Each row carries its item, so the slots draw from it without finding it again
const listItems = computed(() =>
  items.map<UiListItem<string> & { item: T }>((item) => ({ hasMarkSlot: true, item, title: item.id, value: item.id })),
);
const anchor = ref<HTMLElement>();
const selectedId = ref("");
// Resolved against the list rather than held on its own, so an item that leaves it — an upgrade just bought, which
// The store stops listing — closes its details instead of rendering them for an id the list no longer has
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
    <template #mark="{ item: { item } }">
      <NuxtImg size-6 object-contain :src="item.image" alt="" />
    </template>
    <template #title="{ item: { item } }">
      <ClickerModelItemListTitle :item />
    </template>
    <template #append="{ item: { item } }">
      <span v-if="item.amount" ui-title>{{ item.amount }}</span>
    </template>
  </UiList>
  <UiPopover v-model:is-open="isOpen" :anchor :label="selectedId" :position-area>
    <slot v-if="selectedItem" :item="selectedItem" name="detail" />
  </UiPopover>
</template>
