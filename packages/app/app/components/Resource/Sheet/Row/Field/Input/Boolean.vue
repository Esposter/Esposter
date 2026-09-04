<script setup lang="ts">
import type { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";

interface Props {
  column: BooleanColumn;
  isInline?: true;
}

const { column, isInline } = defineProps<Props>();
const modelValue = defineModel<boolean | null>({ required: true });
</script>

<template>
  <v-checkbox v-model="modelValue" :label="isInline ? '' : column.name" />
</template>
