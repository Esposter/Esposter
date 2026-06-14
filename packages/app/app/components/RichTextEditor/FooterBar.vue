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
  append: (props: FooterBarAppendSlotProps) => VNode;
  prepend: (props: FooterBarPrependSlotProps) => VNode;
}>();

const { editor } = defineProps<FooterBarProps>();
</script>

<template>
  <div pr-2 flex items-center>
    <slot name="prepend" :editor />
    <v-spacer />
    <slot name="append" :editor />
  </div>
</template>
