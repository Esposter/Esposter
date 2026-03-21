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
        m-0
        size="small"
        tile
        :icon="hidden ? 'mdi-eye-off' : 'mdi-eye'"
        :="props"
        @click="toggleColumnVisibility(columnId)"
      />
    </template>
  </v-tooltip>
</template>
