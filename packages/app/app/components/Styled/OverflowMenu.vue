<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { mergeProps } from "vue";

interface StyledOverflowMenuProps {
  icon?: string;
  items: Item[];
  text?: string;
}

const { icon = "mdi-dots-vertical", items, text = "More commands" } = defineProps<StyledOverflowMenuProps>();
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-tooltip :text>
        <template #activator="{ props: tooltipProps }">
          <v-btn :icon :="mergeProps(menuProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="{ active, color, icon: itemIcon, onClick, title } of items"
        :key="title"
        :active
        :base-color="color"
        :prepend-icon="itemIcon"
        :title
        @click="onClick"
      />
    </v-list>
  </v-menu>
</template>
