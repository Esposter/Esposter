<script setup lang="ts">
import { MAX_USER_VOLUME_PERCENTAGE } from "@esposter/db-schema";

interface Props {
  label: string;
}

const modelValue = defineModel<number>({ required: true });
const { label } = defineProps<Props>();
defineEmits<{ end: [value: number] }>();
</script>

<template>
  <div flex flex-col gap-y-1>
    <div text-body-medium>{{ label }}</div>
    <div text-body-small>{{ modelValue }}%</div>
    <v-slider v-model="modelValue" :max="MAX_USER_VOLUME_PERCENTAGE" :min="0" :step="1" @end="$emit('end', $event)" />
  </div>
</template>
