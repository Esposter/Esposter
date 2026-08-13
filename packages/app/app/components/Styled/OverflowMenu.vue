<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

interface StyledOverflowMenuProps {
  icon?: string;
  items: Item[];
  text?: string;
}

const { icon = "mdi-dots-vertical", items, text = "More commands" } = defineProps<StyledOverflowMenuProps>();
</script>

<template>
  <StyledTooltipMenuIconButton :icon :text>
    <v-list density="compact">
      <v-list-item
        v-for="{ active, color, disabled, icon: itemIcon, onClick, title } of items"
        :key="title"
        :active
        :base-color="color"
        :disabled
        :prepend-icon="itemIcon"
        :title
        @click="onClick"
      />
    </v-list>
  </StyledTooltipMenuIconButton>
</template>
