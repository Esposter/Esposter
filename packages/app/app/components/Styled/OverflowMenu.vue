<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

interface Props {
  icon?: string;
  items: Item[];
  text?: string;
}

const { icon = "mdi-dots-vertical", items, text = "More commands" } = defineProps<Props>();
</script>

<template>
  <StyledTooltipMenuIconButton :icon :text>
    <v-list density="compact">
      <template
        v-for="{ active, color, disabled, icon: itemIcon, isGroupStart, items: childItems, onClick, title } of items"
        :key="title"
      >
        <v-divider v-if="isGroupStart" />
        <v-menu v-if="childItems" :disabled location="end">
          <template #activator="{ props: submenuActivatorProps }">
            <v-list-item
              append-icon="mdi-chevron-right"
              :base-color="color"
              :disabled
              :prepend-icon="itemIcon"
              :title
              :="submenuActivatorProps"
            />
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="childItem of childItems"
              :key="childItem.title"
              :base-color="childItem.color"
              :disabled="childItem.disabled"
              :prepend-icon="childItem.icon"
              :title="childItem.title"
              @click="childItem.onClick?.($event)"
            />
          </v-list>
        </v-menu>
        <v-list-item v-else :active :base-color="color" :disabled :prepend-icon="itemIcon" :title @click="onClick" />
      </template>
    </v-list>
  </StyledTooltipMenuIconButton>
</template>
