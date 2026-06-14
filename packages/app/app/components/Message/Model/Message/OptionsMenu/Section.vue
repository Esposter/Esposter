<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

interface MessageModelMessageOptionsMenuSectionProps {
  items: Item[];
}

const { items } = defineProps<MessageModelMessageOptionsMenuSectionProps>();
</script>

<template>
  <template v-if="items.length > 0">
    <v-list-item py-2 min-height="auto">
      <v-divider />
    </v-list-item>
    <v-list-item v-for="{ title, color, icon, onClick } of items" :key="title" @click="onClick?.($event)">
      <span :class="color ? `text-${color}` : undefined">{{ title }}</span>
      <template #append>
        <v-icon size="small" :color :icon />
      </template>
    </v-list-item>
  </template>
</template>
