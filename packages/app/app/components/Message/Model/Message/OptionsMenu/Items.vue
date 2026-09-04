<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

interface Props {
  items: Item[];
}

const { items } = defineProps<Props>();
</script>

<template>
  <StyledTooltipIconButton
    v-for="{ icon, shortTitle, title, onClick } of items"
    :key="title"
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    :icon
    :text="shortTitle ?? title"
    @click="onClick?.($event)"
  />
</template>
