<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";
import { getLanguageExtension } from "@/services/codemirror/getLanguageExtension";
import type { EditorView } from "@codemirror/view";
import { Codemirror } from "vue-codemirror";

interface FileRendererCodeProps extends FileRendererProps {
  language: string;
}

const { url, language } = defineProps<FileRendererCodeProps>();
const code = ref(await (await fetch(url)).text());
const extensions = computedAsync(() => getLanguageExtension(language));
const editorView = shallowRef<EditorView>();
</script>

<template>
  <StyledCard w-full>
    <Codemirror v-model="code" :extensions disabled @ready="({ view }) => (editorView = view)" />
  </StyledCard>
</template>
