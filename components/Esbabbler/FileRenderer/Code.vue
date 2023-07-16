<script setup lang="ts">
import type { FileRendererProps } from "@/models/esbabbler/file/FileRendererProps";
import { extendedLanguages } from "@/models/esbabbler/file/LanguageRegexSupportPatternMap";
import { Compartment } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { Codemirror } from "vue-codemirror";

interface FileRendererCodeProps extends FileRendererProps {
  language: string;
}

const props = defineProps<FileRendererCodeProps>();
const { url, language } = toRefs(props);
const code = ref(await (await fetch(url.value)).text());
const languageRequested = computed(() => extendedLanguages.find((l) => l.name === language.value));
const languageConfiguration = ref(new Compartment());
const languageSupport = ref(languageRequested.value ? await languageRequested.value.load() : undefined);
const languageExtension = computed(() =>
  // @ts-ignore
  languageSupport.value ? languageConfiguration.value.of(languageSupport.value) : undefined,
);
const editorView = shallowRef<EditorView>();
</script>

<template>
  <StyledCard w="full">
    <Codemirror v-model="code" :extensions="languageExtension" disabled @ready="({ view }) => (editorView = view)" />
  </StyledCard>
</template>
