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
const languageConfiguration = ref(new Compartment());
const languageSupport = ref(languageRequested.value ? await languageRequested.value.load() : undefined);
const languageExtension = computed(() =>
  // @ts-expect-error Type instantiation is excessively deep and possibly infinite. ts(2589)
  languageSupport.value ? languageConfiguration.value.of(languageSupport.value) : undefined,
);
const editorView = shallowRef<EditorView>();
</script>

<template>
  <StyledCard w-full>
    <Codemirror v-model="code" :extensions="languageExtension" disabled @ready="({ view }) => (editorView = view)" />
  </StyledCard>
</template>
