<script setup lang="ts">
import type { EmailEditorTabItemCategoryDefinition } from "@/models/emailEditor/EmailEditorTabItemCategoryDefinition";
import type { TabItem } from "@/models/vuetify/TabItem";

import { useEmailEditorStore } from "@/store/emailEditor";
import mjml2html from "mjml-browser";

interface PreviewTabProps {
  item: TabItem;
}

const { item: baseItem } = defineProps<PreviewTabProps>();
const item = computed(() => baseItem as EmailEditorTabItemCategoryDefinition);
const emailEditorStore = useEmailEditorStore();
const { emailEditor } = storeToRefs(emailEditorStore);
const html = computed(() => {
  try {
    return mjml2html(emailEditor.value.mjml, { validationLevel: "strict" }).html;
  } catch {
    return "";
  }
});
</script>

<template>
  <v-tabs-window-item :value="item.value">
    <div v-if="html" v-html="html" />
    <div v-else h-full flex justify-center items-center font-900 leading-tight font-inter text-5xl>
      Failed to parse mjml
    </div>
  </v-tabs-window-item>
</template>
