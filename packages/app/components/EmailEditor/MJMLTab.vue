<script setup lang="ts">
import type { EmailEditorTabItemCategoryDefinition } from "@/models/emailEditor/EmailEditorTabItemCategoryDefinition";
import type { TabItem } from "@/models/vuetify/TabItem";
import { getLanguageExtension } from "@/services/codemirror/getLanguageExtension";
import { useEmailEditorStore } from "@/store/emailEditor";
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
const extensions = await getLanguageExtension("HTML");
</script>

<template>
  <v-tabs-window-item :value="item.value">
    <Codemirror v-model="emailEditor.mjml" :extensions @ready="({ view }) => (editorView = view)" />
  </v-tabs-window-item>
</template>
