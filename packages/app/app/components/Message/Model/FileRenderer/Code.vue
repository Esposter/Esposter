<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { getLanguageExtension } from "@/services/codemirror/getLanguageExtension";
import { PREVIEW_MAX_HEIGHT } from "@/services/message/file/constants";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { Codemirror } from "vue-codemirror";

interface Props extends FileRendererComponentProps {
  language: string;
}

const { isPreview, language, url } = defineProps<Props>();
const code = ref("");
code.value = await getResultAsync(async () => {
  const response = await fetch(url);
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response.text();
})
  .orTee(console.error)
  .unwrapOr("");
const baseExtensions = computedAsync(() => getLanguageExtension(language), []);
const extensions = useExtensions(baseExtensions);
</script>

<template>
  <StyledCard>
    <Codemirror
      v-model="code"
      :style="isPreview ? { maxHeight: PREVIEW_MAX_HEIGHT, pointerEvents: 'auto', userSelect: 'auto' } : undefined"
      :extensions
      disabled
    />
  </StyledCard>
</template>
