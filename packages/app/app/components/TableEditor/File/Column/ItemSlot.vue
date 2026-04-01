<script setup lang="ts">
import type { Column } from "#shared/models/tableEditor/file/column/Column";

interface ColumnItemSlotProps {
  column: Column;
}

const { column } = defineProps<ColumnItemSlotProps>();
</script>

<template>
  <span>{{ column.name }}</span>
</template>
