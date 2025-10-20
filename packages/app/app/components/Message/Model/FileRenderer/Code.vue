<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";
import type { EditorView } from "@codemirror/view";

import { getLanguageExtension } from "@/services/codemirror/getLanguageExtension";
import { PREVIEW_MAX_HEIGHT } from "@/services/message/file/constants";
import { Codemirror } from "vue-codemirror";

interface FileRendererCodeProps extends FileRendererComponentProps {
  language: string;
}

const { isPreview, language, url } = defineProps<FileRendererCodeProps>();
const code = ref(await (await fetch(url)).text());
const baseExtensions = computedAsync(() => getLanguageExtension(language), []);
const extensions = useExtensions(baseExtensions);
const editorView = shallowRef<EditorView>();
</script>

<template>
  <StyledCard>
    <Codemirror
      v-model="code"
      :style="isPreview ? { maxHeight: PREVIEW_MAX_HEIGHT, pointerEvents: 'auto', userSelect: 'auto' } : undefined"
      :extensions
      disabled
      @ready="({ view }) => (editorView = view)"
    />
  </StyledCard>
</template>
