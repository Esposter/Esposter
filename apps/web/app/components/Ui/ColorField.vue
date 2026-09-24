<script setup lang="ts">
interface Props {
  label: string;
}

// A colour picked with the browser's own picker, which follows the page's colour scheme, shown as a swatch beside the
// Hex value it holds. The swatch is the control, so its label names it
const modelValue = defineModel<string>({ required: true });
const { label } = defineProps<Props>();
const id = useId();
</script>

<template>
  <!-- The value beside the swatch rather than inside the label, so the label alone names the control -->
  <div flex gap-2 items-end>
    <label :for="id" flex flex-col gap-1>
      <span text-muted>{{ label }}</span>
      <input :id v-model="modelValue" type="color" p-1 size-8 cursor-pointer ui-field />
    </label>
    <code text-muted flex h-8 items-center>{{ modelValue }}</code>
  </div>
</template>
