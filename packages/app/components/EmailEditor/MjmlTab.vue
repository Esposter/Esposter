<script setup lang="ts">
import type { EmailEditorTabItemCategoryDefinition } from "@/models/emailEditor/EmailEditorTabItemCategoryDefinition";
import { extendedLanguages } from "@/models/esbabbler/file/LanguageRegexSupportPatternMap";
import type { TabItem } from "@/models/vuetify/TabItem";
import { useEmailEditorStore } from "@/store/emailEditor";
import type { Extension } from "@codemirror/state";
import { Compartment } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { Codemirror } from "vue-codemirror";

interface MjmlTabProps {
  item: TabItem;
}

const { item: baseItem } = defineProps<MjmlTabProps>();
const item = computed(() => baseItem as EmailEditorTabItemCategoryDefinition);
const emailEditorStore = useEmailEditorStore();
const { emailEditor } = storeToRefs(emailEditorStore);
const editorView = shallowRef<EditorView>();
const extensions: Extension[] = [];
const languageRequested = extendedLanguages.find((l) => l.name === "HTML");
if (languageRequested) {
  const languageSupport = await languageRequested.load();
  const languageConfiguration = new Compartment();
  extensions.push(languageConfiguration.of(languageSupport));
}
</script>

<template>
  <v-tabs-window-item :value="item.value">
    <Codemirror v-model="emailEditor.mjml" :extensions @ready="({ view }) => (editorView = view)" />
  </v-tabs-window-item>
</template>
