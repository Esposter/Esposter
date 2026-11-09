<script setup lang="ts">
import type { FooterBarSlotProps } from "@/components/RichTextEditor/FooterBarSlotProps";

import { POST_DESCRIPTION_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  height?: string;
  placeholder?: string;
}

defineSlots<{ "append-footer": (props: FooterBarSlotProps) => VNode }>();
const modelValue = defineModel<string>({ required: true });
const { height = "15rem" } = defineProps<Props>();
</script>

<template>
  <RichTextEditor v-model="modelValue" :height :placeholder :limit="POST_DESCRIPTION_MAX_LENGTH">
    <template #append-footer="{ editor }">
      <slot name="append-footer" :editor />
    </template>
  </RichTextEditor>
</template>
