<script setup lang="ts">
import { CharacterCount } from "@tiptap/extension-character-count";
import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { POST_MAX_DESCRIPTION_LENGTH } from "@/util/constants.common";

interface RichTextEditorProps {
  content?: string;
}

const props = withDefaults(defineProps<RichTextEditorProps>(), { content: "" });
const { content } = toRefs(props);
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: "Text (optional)" }),
    CharacterCount.configure({ limit: POST_MAX_DESCRIPTION_LENGTH }),
  ],
  content: content.value,
});

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <StyledCard>
    <RichTextEditorMenuBar :editor="editor" />
    <v-divider thickness="2" />
    <ClientOnly>
      <EditorContent :editor="editor" />
    </ClientOnly>
  </StyledCard>
</template>

<style lang="scss">
.ProseMirror {
  padding: 1rem;
  height: 15rem;
  overflow-y: auto;

  p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    height: 0;
    float: left;
    opacity: 0.4;
    pointer-events: none;
  }
}
</style>
