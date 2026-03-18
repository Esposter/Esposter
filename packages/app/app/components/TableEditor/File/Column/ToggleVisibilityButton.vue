<script setup lang="ts">
import { getToggleColumnVisibilityDescription } from "@/services/tableEditor/file/commands/getToggleColumnVisibilityDescription";

interface ToggleVisibilityButtonProps {
  columnId: string;
  columnName: string;
  hidden: boolean;
}

const { columnId, columnName, hidden } = defineProps<ToggleVisibilityButtonProps>();
const toggleColumnVisibility = useToggleColumnVisibility();
</script>

<template>
  <v-tooltip :text="getToggleColumnVisibilityDescription(columnName, hidden)">
    <template #activator="{ props }">
      <v-btn
        :icon="hidden ? 'mdi-eye-off' : 'mdi-eye'"
        density="compact"
        variant="text"
        :="props"
        @click="toggleColumnVisibility(columnId)"
      />
    </template>
  </v-tooltip>
</template>
