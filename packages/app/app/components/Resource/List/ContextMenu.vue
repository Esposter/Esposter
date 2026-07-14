<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

interface ResourceListContextMenuProps {
  position: [number, number];
  resource: Resource;
}

const isOpen = defineModel<boolean>({ required: true });
const { position, resource } = defineProps<ResourceListContextMenuProps>();
const { getActionItems } = useResourceListActionItems();
</script>

<template>
  <v-menu v-model="isOpen" :target="position">
    <v-list density="compact">
      <v-list-item
        v-for="{ color, icon, onClick, title } of getActionItems(resource)"
        :key="title"
        :base-color="color"
        :prepend-icon="icon"
        :title
        @click="onClick"
      />
    </v-list>
  </v-menu>
</template>
