<script setup lang="ts">
import { StarterKit } from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { CharacterCount } from "@tiptap/extension-character-count";
import { POST_MAX_CHARACTER_LENGTH } from "@/util/constants";

interface RichTextEditorProps {
  content?: string;
}

const props = defineProps<RichTextEditorProps>();
const content = toRef(props, "content");
const editor = useEditor({
  extensions: [StarterKit, CharacterCount.configure({ limit: POST_MAX_CHARACTER_LENGTH })],
  content: content.value,
});
const { border } = useGlobalTheme().value.colors;

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <ClientOnly>
    <v-card class="border">
      <RichTextEditorMenuBar :editor="editor" />
      <v-divider thickness="2" />
      <EditorContent :editor="editor" />
    </v-card>
  </ClientOnly>
</template>

<style scoped lang="scss">
.border {
  border: 1px solid v-bind(border) !important;
}
</style>

<style lang="scss">
.ProseMirror {
  padding: 1rem;
  height: 15rem;
  overflow-y: auto;
}
</style>
