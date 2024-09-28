<script setup lang="ts">
import type { EmitEvents, ModelValue, VueDatePickerProps } from "@vuepic/vue-datepicker";

import VueDatePicker from "@vuepic/vue-datepicker";

interface StyledDatePickerProps {
  datePickerProps?: VueDatePickerProps;
}

const modelValue = defineModel<ModelValue>();
const { datePickerProps } = defineProps<StyledDatePickerProps>();
defineEmits<(emitEvents: EmitEvents) => void>();
const slots = defineSlots<Record<keyof InstanceType<typeof VueDatePicker>["$slots"], Function>>();
const isDark = useIsDark();
const { border, surface } = useColors();
</script>

<template>
  <VueDatePicker v-model="modelValue" teleport-center :="datePickerProps" :dark="isDark">
    <template v-for="(_, slot) of slots" #[slot]="scope">
      <slot :name="slot" :="{ ...scope }" />
    </template>
  </VueDatePicker>
</template>

<style lang="scss">
@import "@vuepic/vue-datepicker/dist/main.css";
</style>

<style scoped lang="scss">
:deep(.dp__input) {
  background-color: v-bind(surface);
  border: 1px $border-style-root v-bind(border);
}
</style>
