<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

interface Props {
  datePickerProps?: InstanceType<typeof VueDatePicker>["$props"];
}

const slots = defineSlots<Record<keyof (typeof VueDatePicker)["$slots"], () => VNode>>();
const modelValue = defineModel<Date | null>({ required: true });
const { datePickerProps } = defineProps<Props>();
const isDark = useIsDark();
</script>

<template>
  <VueDatePicker v-model="modelValue" centered :="datePickerProps" :dark="isDark">
    <template v-for="(_slot, name) of slots" #[name]="scope">
      <slot :name :="scope" />
    </template>
  </VueDatePicker>
</template>

<style scoped>
/* The input is a field, as the library draws one: the panel tone on the control's corner, with no edge */
:deep(.dp__input) {
  background-color: var(--ui-panel);
  border: none;
  border-radius: var(--ui-control-radius);
  color: inherit;
}
</style>
