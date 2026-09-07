<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

interface Props {
  position: [number, number];
  resource: Resource;
}

const isOpen = defineModel<boolean>({ required: true });
const { position, resource } = defineProps<Props>();
const { getActionItems } = useResourceListActionItems();
const actionItems = computed(() => getActionItems(resource));
</script>

<template>
  <v-menu v-model="isOpen" :target="position">
    <v-list density="compact">
      <v-list-item
        v-for="{ color, icon, onClick, title } of actionItems"
        :key="title"
        :base-color="color"
        :prepend-icon="icon"
        :title
        @click="onClick"
      />
    </v-list>
  </v-menu>
</template>
