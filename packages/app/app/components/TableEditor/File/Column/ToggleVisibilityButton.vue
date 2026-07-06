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
  <StyledTooltipIconButton
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    :icon="hidden ? 'mdi-eye-off' : 'mdi-eye'"
    :text="getToggleColumnVisibilityDescription(columnName, hidden)"
    @click="toggleColumnVisibility(columnId)"
  />
</template>
