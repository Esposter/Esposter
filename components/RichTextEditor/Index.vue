<script setup lang="ts">
import { POST_DESCRIPTION_MAX_LENGTH } from "@/util/constants.common";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";

interface RichTextEditorProps {
  content?: string;
}

const props = withDefaults(defineProps<RichTextEditorProps>(), { content: "" });
const { content } = $(toRefs(props));
const emit = defineEmits<{
  (event: "update:content", value: string): void;
}>();
const editor = $(
  useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Text (optional)" }),
      CharacterCount.configure({ limit: POST_DESCRIPTION_MAX_LENGTH }),
    ],
    content,
    onUpdate: ({ editor }) => emit("update:content", editor.getHTML()),
  })
);

onBeforeUnmount(() => editor?.destroy());
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

<style scoped lang="scss">
:deep(.ProseMirror) {
  padding: 1rem;
  height: 15rem;
  overflow-y: auto;

  ul,
  ol {
    padding: 0 1rem;
  }

  p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    height: 0;
    float: left;
    opacity: 0.4;
    pointer-events: none;
  }
}
</style>
