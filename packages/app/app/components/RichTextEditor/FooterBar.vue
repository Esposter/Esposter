<script setup lang="ts">
import type { FooterBarSlotProps } from "@/components/RichTextEditor/FooterBarSlotProps";

defineSlots<{
  append: (props: FooterBarSlotProps) => VNode;
  prepend: (props: FooterBarSlotProps) => VNode;
}>();

const { editor } = defineProps<FooterBarSlotProps>();
</script>

<template>
  <div pr-2 flex items-center>
    <slot name="prepend" :editor />
    <v-spacer />
    <slot name="append" :editor />
  </div>
</template>
