<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

export interface FooterBarAppendSlotProps {
  editor?: Editor;
}

export interface FooterBarPrependSlotProps {
  editor?: Editor;
}

interface FooterBarProps {
  editor?: Editor;
}

defineSlots<{
  append: (props: FooterBarAppendSlotProps) => unknown;
  prepend: (props: FooterBarPrependSlotProps) => unknown;
}>();

const { editor } = defineProps<FooterBarProps>();
</script>

<template>
  <div flex items-center pr-2>
    <slot name="prepend" :editor />
    <v-spacer />
    <slot name="append" :editor />
  </div>
</template>
