<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

interface FooterBarProps {
  editor?: Editor;
}

const props = defineProps<FooterBarProps>();
const { editor } = toRefs(props);
</script>

<template>
  <div pr="2" display="flex" items="center">
    <slot name="prepend" :editor="editor" />
    <v-spacer />
    <slot name="append" :editor="editor" />
  </div>
</template>
