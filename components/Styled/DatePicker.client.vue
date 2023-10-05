<script setup lang="ts">
import type { EmitEvents, ModelValue, VueDatePickerProps } from "@vuepic/vue-datepicker";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

interface StyledDatePickerProps {
  datePickerProps?: VueDatePickerProps;
}

const modelValue = defineModel<ModelValue>();
const { datePickerProps } = defineProps<StyledDatePickerProps>();
defineEmits<{ (e: EmitEvents): void }>();
const slots = defineSlots<Record<keyof InstanceType<typeof VueDatePicker>["$slots"], Function>>();
const isDark = useIsDark();
const { surface } = useColors();
</script>

<template>
  <VueDatePicker v-model="modelValue" :="datePickerProps" :dark="isDark" :teleport="true">
    <template v-for="(_, slot) of slots" #[slot]="scope">
      <slot :name="slot" :="{ ...scope }" />
    </template>
  </VueDatePicker>
</template>

<style scoped lang="scss">
:deep(.dp__input) {
  background-color: v-bind(surface);
  border: 1px solid;
}
</style>
