<script setup lang="ts" generic="TItem">
import type { UiListItem } from "@/models/ui/UiListItem";

import { getTimelineSections } from "@/services/message/draftsAndSent/getTimelineSections";
import { takeOne } from "@esposter/shared";
import { parse } from "node-html-parser";

interface Props {
  getDate: (item: TItem) => Date;
  // The row an item is drawn as, its description the message's HTML, which the list reads as text
  getRow: (item: TItem) => UiListItem<string>;
  items: TItem[];
  label: string;
}
// Messages under the day they belong to, each row the room it is in, the message's text and its time, with the row's
// Actions beside it
defineSlots<{ actions?: (props: { item: TItem }) => VNode }>();
const { getDate, getRow, items, label } = defineProps<Props>();
const itemRecord = computed(() => Object.fromEntries(items.map((item) => [getRow(item).value, item])));
const rows = computed(() =>
  getTimelineSections(items, getDate).flatMap(({ items: sectionItems, title }) =>
    sectionItems.map((item) => {
      const row = getRow(item);
      return { ...row, description: row.description ? parse(row.description).textContent : undefined, group: title };
    }),
  ),
);
</script>

<template>
  <UiList :items="rows" :label>
    <template #append="{ item }">
      <NuxtTime
        :datetime="getDate(takeOne(itemRecord, item.value))"
        hour="numeric"
        minute="2-digit"
        text-sm
        text-muted
        shrink-0
      />
    </template>
    <template v-if="$slots.actions" #actions="{ item }">
      <slot name="actions" :item="takeOne(itemRecord, item.value)" />
    </template>
  </UiList>
</template>
