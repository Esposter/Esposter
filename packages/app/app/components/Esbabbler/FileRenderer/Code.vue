<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";
import type { EditorView } from "@codemirror/view";

import { getLanguageExtension } from "@/services/codemirror/getLanguageExtension";
import { PREVIEW_MAX_HEIGHT } from "@/services/esbabbler/file/constants";
import { Codemirror } from "vue-codemirror";

interface FileRendererCodeProps extends FileRendererProps {
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
      :style="{ maxHeight: isPreview ? PREVIEW_MAX_HEIGHT : undefined }"
      :extensions
      disabled
      @ready="({ view }) => (editorView = view)"
    />
  </StyledCard>
</template>
