<script setup lang="ts">
import type { RendererProps } from "@/models/file";
import type { LanguageSupport } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { Compartment } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { Codemirror } from "vue-codemirror";

const props = defineProps<RendererProps>();
const { url, type } = $(toRefs(props));
const code = $ref(await (await fetch(url)).text());
const languageConfiguration = $ref(new Compartment());
const languageSupport = ref<LanguageSupport>();
const languageExtension = $computed(() =>
  languageSupport.value ? languageConfiguration.of(languageSupport.value) : undefined
);
const editorView = shallowRef<EditorView>();

for (const language of languages) {
  if (language.name === type) {
    languageSupport.value = await language.load();
    break;
  }
}

watch([editorView, languageSupport], ([editorView, languageSupport]) => {
  if (!editorView || !languageSupport) return;
  editorView.dispatch({ effects: languageConfiguration.reconfigure(languageSupport) });
});
</script>

<template>
  <Codemirror v-model="code" :extensions="languageExtension" @ready="({ view }) => (editorView = view)" />
</template>
