<script setup lang="ts">
import type { FileRendererProps } from "@/models/file";
import { extendedLanguages } from "@/models/file";
import { Compartment } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { Codemirror } from "vue-codemirror";

interface CodeRendererProps extends FileRendererProps {
  language: string;
}

const props = defineProps<CodeRendererProps>();
const { url, language } = $(toRefs(props));
const code = $ref(await (await fetch(url)).text());
const languageRequested = $computed(() => extendedLanguages.find((l) => l.name === language));
const languageConfiguration = $ref(new Compartment());
const languageSupport = ref(languageRequested ? await languageRequested.load() : undefined);
const languageExtension = $computed(() =>
  // @ts-ignore
  languageSupport.value ? languageConfiguration.of(languageSupport.value) : undefined
);
const editorView = shallowRef<EditorView>();
</script>

<template>
  <StyledCard w="full">
    <Codemirror v-model="code" :extensions="languageExtension" disabled @ready="({ view }) => (editorView = view)" />
  </StyledCard>
</template>
