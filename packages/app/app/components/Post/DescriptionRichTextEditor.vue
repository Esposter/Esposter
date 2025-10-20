<script setup lang="ts">
import type { FooterBarAppendSlotProps } from "@/components/RichTextEditor/FooterBar.vue";

import { POST_DESCRIPTION_MAX_LENGTH } from "@esposter/db-schema";

export interface DescriptionRichTextEditorProps {
  height?: string;
  placeholder?: string;
}

const modelValue = defineModel<string>({ required: true });
const { height = "15rem", placeholder } = defineProps<DescriptionRichTextEditorProps>();
const slots = defineSlots<{
  "append-footer": (props: FooterBarAppendSlotProps) => VNode;
}>();
</script>

<template>
  <RichTextEditor v-model="modelValue" :height :placeholder :limit="POST_DESCRIPTION_MAX_LENGTH">
    <template #append-footer="{ editor }">
      <slot name="append-footer" :editor />
    </template>
  </RichTextEditor>
</template>
