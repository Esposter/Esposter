<script setup lang="ts">
import { getToggleColumnVisibilityDescription } from "@/services/resource/sheet/commands/getToggleColumnVisibilityDescription";
import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";

interface Props {
  columnId: string;
  columnName: string;
  isHidden: boolean;
}

const { columnId, columnName, isHidden } = defineProps<Props>();
const toggleColumnVisibility = useToggleColumnVisibility();
</script>

<template>
  <StyledTooltipIconButton
    :button-props="DENSE_ICON_BUTTON_PROPS"
    :icon="isHidden ? 'mdi-eye-off' : 'mdi-eye'"
    :text="getToggleColumnVisibilityDescription(columnName, isHidden)"
    @click="toggleColumnVisibility(columnId)"
  />
</template>
