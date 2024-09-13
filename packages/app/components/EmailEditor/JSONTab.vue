<script setup lang="ts">
import type { EmailEditorTabItemCategoryDefinition } from "@/models/emailEditor/EmailEditorTabItemCategoryDefinition";
import type { TabItem } from "@/models/vuetify/TabItem";
import type { EditorView } from "@codemirror/view";

import { getLanguageExtension } from "@/services/codemirror/getLanguageExtension";
import { useEmailEditorStore } from "@/store/emailEditor";
import mjml2html from "mjml-browser";
import { Codemirror } from "vue-codemirror";

interface MjmlTabProps {
  item: TabItem;
}

const { item: baseItem } = defineProps<MjmlTabProps>();
const item = computed(() => baseItem as EmailEditorTabItemCategoryDefinition);
const emailEditorStore = useEmailEditorStore();
const { emailEditor } = storeToRefs(emailEditorStore);
const json = computed(() => {
  try {
    return JSON.stringify(mjml2html(emailEditor.value.mjml, { validationLevel: "strict" }).json, null, "\t");
  } catch {
    return "";
  }
});
const baseExtensions = await getLanguageExtension("JSON");
const extensions = useExtensions(baseExtensions);
const editorView = shallowRef<EditorView>();
</script>

<template>
  <v-tabs-window-item :value="item.value">
    <Codemirror v-model="json" :extensions disabled @ready="({ view }) => (editorView = view)" />
  </v-tabs-window-item>
</template>
