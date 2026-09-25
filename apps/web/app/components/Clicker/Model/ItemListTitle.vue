<script setup lang="ts">
import type { ClickerListItem } from "@/models/clicker/ClickerListItem";

import { formatNumberLong } from "@/services/clicker/formatNumberLong";

interface Props {
  item: ClickerListItem;
}
// An item's name over its price. A price still to pay reads green while it can be paid and red while it cannot, as
// Cookie Clicker's does, and one already paid in the muted colour
const { item } = defineProps<Props>();
const priceClass = computed(() => {
  if (item.isAffordable === undefined) return "text-muted";
  else if (item.isAffordable) return "text-success";
  else return "text-error";
});
</script>

<template>
  <span text-text block truncate>{{ item.id }}</span>
  <span :class="priceClass" text-sm flex gap-1 items-center>
    {{ formatNumberLong(item.price) }}
    <ClickerModelItem size-4 />
  </span>
</template>
