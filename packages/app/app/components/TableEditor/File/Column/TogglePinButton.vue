<script setup lang="ts">
import { getToggleColumnPinDescription } from "@/services/tableEditor/file/commands/getToggleColumnPinDescription";

interface TogglePinButtonProps {
  columnId: string;
  columnName: string;
  fixed: boolean;
}

const { columnId, columnName, fixed } = defineProps<TogglePinButtonProps>();
const toggleColumnPin = useToggleColumnPin();
</script>

<template>
  <v-tooltip :text="getToggleColumnPinDescription(columnName, fixed)">
    <template #activator="{ props }">
      <v-btn
        m-0
        size="small"
        tile
        :icon="fixed ? 'mdi-pin-off' : 'mdi-pin'"
        :="props"
        @click="toggleColumnPin(columnId)"
      />
    </template>
  </v-tooltip>
</template>
