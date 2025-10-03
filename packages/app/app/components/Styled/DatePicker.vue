<script setup lang="ts">
import type { EmitEvents, ModelValue, VueDatePickerProps } from "@vuepic/vue-datepicker";

import VueDatePicker from "@vuepic/vue-datepicker";

interface StyledDatePickerProps {
  datePickerProps?: VueDatePickerProps;
}

const modelValue = defineModel<ModelValue>();
const { datePickerProps } = defineProps<StyledDatePickerProps>();
defineEmits<(emitEvents: EmitEvents) => void>();
const slots = defineSlots<Record<keyof InstanceType<typeof VueDatePicker>["$slots"], () => VNode>>();
const isDark = useIsDark();
const { border, surface } = useColors();
</script>

<template>
  <VueDatePicker v-model="modelValue" teleport-center :="datePickerProps" :dark="isDark">
    <template v-for="(_slot, name) of slots" #[name]="scope">
      <slot :name :="{ ...scope }" />
    </template>
  </VueDatePicker>
</template>

<style lang="scss">
@use "@vuepic/vue-datepicker/dist/main.css";
</style>

<style scoped lang="scss">
:deep(.dp__input) {
  background-color: v-bind(surface);
  border: $border-width-root $border-style-root v-bind(border);
}
</style>
