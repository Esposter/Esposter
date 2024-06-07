<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";
import { extendedLanguages } from "@/models/esbabbler/file/LanguageRegexSupportPatternMap";
import { Compartment } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { Codemirror } from "vue-codemirror";

interface FileRendererCodeProps extends FileRendererProps {
  language: string;
}

const { url, language } = defineProps<FileRendererCodeProps>();
const code = ref(await (await fetch(url)).text());
const languageRequested = computed(() => extendedLanguages.find((l) => l.name === language));
const extensions = computedAsync(async () => {
  if (!languageRequested.value) return [];
  const languageSupport = await languageRequested.value.load();
  const languageConfiguration = new Compartment();
  return [languageConfiguration.of(languageSupport)];
});
const editorView = shallowRef<EditorView>();
</script>

<template>
  <StyledCard w-full>
    <Codemirror v-model="code" :extensions disabled @ready="({ view }) => (editorView = view)" />
  </StyledCard>
</template>
