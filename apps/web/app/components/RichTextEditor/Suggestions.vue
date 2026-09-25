<script setup lang="ts">
import type { SuggestionList } from "@/models/message/SuggestionList";
import type { Editor } from "@tiptap/vue-3";

import { useRichTextSuggestionStore } from "@/store/richTextEditor/suggestion";

interface Props {
  editor?: Editor;
}
// The completions this editor's caret opened, drawn in the editor's own tree so its theme scope reaches them, the list
// Handed to the plugin once it is drawn so the keys walk it while focus stays in the document
const { editor } = defineProps<Props>();
const richTextSuggestionStore = useRichTextSuggestionStore();
const { list, suggestion } = storeToRefs(richTextSuggestionStore);
const listComponent = useTemplateRef<SuggestionList>("listComponent");
const ownSuggestion = computed(() => (suggestion.value?.editor === editor ? suggestion.value : undefined));

watch(listComponent, (newListComponent) => {
  list.value = newListComponent ?? undefined;
});
</script>

<template>
  <UiCaretPopover :rect="ownSuggestion?.getRect()">
    <component :is="ownSuggestion.component" v-if="ownSuggestion" ref="listComponent" :="ownSuggestion.props" />
  </UiCaretPopover>
</template>
