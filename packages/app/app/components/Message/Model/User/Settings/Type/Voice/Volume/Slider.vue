<script setup lang="ts">
import { MAX_USER_VOLUME_PERCENTAGE } from "@esposter/db-schema";

interface SliderProps {
  label?: string;
}

const modelValue = defineModel<number>({ required: true });
const { label } = defineProps<SliderProps>();
defineEmits<{ end: [value: number] }>();
</script>

<template>
  <div v-if="label" mb-1 text-body-medium>{{ label }}</div>
  <div mb-2 text-body-small>{{ modelValue }}%</div>
  <v-slider
    v-model="modelValue"
    :max="MAX_USER_VOLUME_PERCENTAGE"
    :min="0"
    :step="1"
    hide-details
    @end="$emit('end', $event)"
  />
</template>
