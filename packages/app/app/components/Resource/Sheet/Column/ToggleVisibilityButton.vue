<script setup lang="ts">
import { getToggleColumnVisibilityDescription } from "@/services/resource/sheet/commands/getToggleColumnVisibilityDescription";
import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";

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
    :button-props="DENSE_ICON_BUTTON_PROPS"
    :icon="hidden ? 'mdi-eye-off' : 'mdi-eye'"
    :text="getToggleColumnVisibilityDescription(columnName, hidden)"
    @click="toggleColumnVisibility(columnId)"
  />
</template>
