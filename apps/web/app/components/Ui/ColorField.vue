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
  <div flex flex-col gap-1>
    <label :for="id" text-muted>{{ label }}</label>
    <div flex gap-2 items-center>
      <input :id v-model="modelValue" type="color" p-1 cursor-pointer size-8 ui-sunk />
      <code text-muted>{{ modelValue }}</code>
    </div>
  </div>
</template>
