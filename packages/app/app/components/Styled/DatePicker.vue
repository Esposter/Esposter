<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";

interface StyledDatePickerProps {
  datePickerProps?: InstanceType<typeof VueDatePicker>["$props"];
}

const modelValue = defineModel<Date | null>({ required: true });
const { datePickerProps } = defineProps<StyledDatePickerProps>();
defineEmits<(emitEvents: (typeof VueDatePicker)["emits"]) => void>();
const slots = defineSlots<Record<keyof (typeof VueDatePicker)["$slots"], () => VNode>>();
const isDark = useIsDark();
const { border, surface } = useColors();
</script>

<template>
  <VueDatePicker v-model="modelValue" centered :="datePickerProps" :dark="isDark">
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
