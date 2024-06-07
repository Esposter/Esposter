<script setup lang="ts">
import type { EmailEditorTabItemCategoryDefinition } from "@/models/emailEditor/EmailEditorTabItemCategoryDefinition";
import type { TabItem } from "@/models/vuetify/TabItem";
import { useEmailEditorStore } from "@/store/emailEditor";
import type { EditorView } from "@codemirror/view";
import mjml2html from "mjml-browser";
import { Codemirror } from "vue-codemirror";
import { getLanguageExtension } from "~/services/codemirror/getLanguageExtension";

interface MjmlTabProps {
  item: TabItem;
}

const { item: baseItem } = defineProps<MjmlTabProps>();
const item = computed(() => baseItem as EmailEditorTabItemCategoryDefinition);
const emailEditorStore = useEmailEditorStore();
const { emailEditor } = storeToRefs(emailEditorStore);
const json = computed(() => {
  try {
    return mjml2html(emailEditor.value.mjml, { validationLevel: "strict" }).json;
  } catch {
    return "";
  }
});
const editorView = shallowRef<EditorView>();
const extensions = await getLanguageExtension("JSON");
</script>

<template>
  <v-tabs-window-item :value="item.value">
    <Codemirror v-model="json" :extensions disabled @ready="({ view }) => (editorView = view)" />
  </v-tabs-window-item>
</template>
