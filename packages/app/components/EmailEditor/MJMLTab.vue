<script setup lang="ts">
import type { EmailEditorTabItemCategoryDefinition } from "@/models/emailEditor/EmailEditorTabItemCategoryDefinition";
import type { TabItem } from "@/models/vuetify/TabItem";
import { getLanguageExtension } from "@/services/codemirror/getLanguageExtension";
import { useEmailEditorStore } from "@/store/emailEditor";
import { oneDark } from "@codemirror/theme-one-dark";
import type { EditorView } from "@codemirror/view";
import { Codemirror } from "vue-codemirror";

interface MjmlTabProps {
  item: TabItem;
}

const { item: baseItem } = defineProps<MjmlTabProps>();
const item = computed(() => baseItem as EmailEditorTabItemCategoryDefinition);
const emailEditorStore = useEmailEditorStore();
const { emailEditor } = storeToRefs(emailEditorStore);
const isDark = useIsDark();
const baseExtensions = await getLanguageExtension("HTML");
const extensions = computed(() => (isDark.value ? baseExtensions.concat(oneDark) : baseExtensions));
const editorView = shallowRef<EditorView>();
</script>

<template>
  <v-tabs-window-item :value="item.value">
    <Codemirror v-model="emailEditor.mjml" :extensions @ready="({ view }) => (editorView = view)" />
  </v-tabs-window-item>
</template>
