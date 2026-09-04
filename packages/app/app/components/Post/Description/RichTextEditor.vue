<script setup lang="ts">
import type { FooterBarSlotProps } from "@/components/RichTextEditor/FooterBar.vue";

import { POST_DESCRIPTION_MAX_LENGTH } from "@esposter/db-schema";

interface PostDescriptionRichTextEditorProps {
  height?: string;
  placeholder?: string;
}

const modelValue = defineModel<string>({ required: true });
const { height = "15rem", placeholder } = defineProps<PostDescriptionRichTextEditorProps>();
defineSlots<{
  "append-footer": (props: FooterBarSlotProps) => VNode;
}>();
</script>

<template>
  <RichTextEditor v-model="modelValue" :height :placeholder :limit="POST_DESCRIPTION_MAX_LENGTH">
    <template #append-footer="{ editor }">
      <slot name="append-footer" :editor />
    </template>
  </RichTextEditor>
</template>
