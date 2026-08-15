<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

export interface FooterBarSlotProps {
  editor?: Editor;
}

interface FooterBarProps {
  editor?: Editor;
}

defineSlots<{
  append: (props: FooterBarSlotProps) => VNode;
  prepend: (props: FooterBarSlotProps) => VNode;
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
