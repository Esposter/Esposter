<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

interface FooterBarProps {
  editor?: Editor;
}

export interface FooterBarPrependSlotProps {
  editor?: Editor;
}

export interface FooterBarAppendSlotProps {
  editor?: Editor;
}

defineSlots<{
  prepend: (props: FooterBarPrependSlotProps) => unknown;
  append: (props: FooterBarAppendSlotProps) => unknown;
}>();

const { editor } = defineProps<FooterBarProps>();
</script>

<template>
  <div pr-2 flex items-center>
    <slot name="prepend" :editor="editor" />
    <v-spacer />
    <slot name="append" :editor="editor" />
  </div>
</template>
