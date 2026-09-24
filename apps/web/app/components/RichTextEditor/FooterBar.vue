<script setup lang="ts">
import type { FooterBarSlotProps } from "@/components/RichTextEditor/FooterBarSlotProps";

defineSlots<{
  append: (props: FooterBarSlotProps) => VNode;
  prepend: (props: FooterBarSlotProps) => VNode;
}>();

const { editor } = defineProps<FooterBarSlotProps>();
</script>

<template>
  <div p-1 flex flex-wrap gap-1 items-center>
    <slot name="prepend" :editor />
    <div flex-1 />
    <slot name="append" :editor />
  </div>
</template>
