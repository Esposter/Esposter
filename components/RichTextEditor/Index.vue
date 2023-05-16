<script setup lang="ts">
import { CharacterCount } from "@tiptap/extension-character-count";
import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";
import type { AnyExtension } from "@tiptap/vue-3";
import { EditorContent, useEditor } from "@tiptap/vue-3";

interface RichTextEditorProps {
  modelValue: string;
  placeholder: string;
  maxLength: number;
  extensions?: AnyExtension[];
}

const props = defineProps<RichTextEditorProps>();
const { modelValue, placeholder, maxLength, extensions } = toRefs(props);
const emit = defineEmits<{
  "update:model-value": [value: string];
}>();
const slots = useSlots();
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: placeholder.value }),
    CharacterCount.configure({ limit: maxLength.value }),
    ...(extensions?.value ?? []),
  ],
  content: modelValue.value,
  onUpdate: ({ editor }) => {
    emit("update:model-value", editor.getHTML());
  },
});

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <StyledCard w="full">
    <RichTextEditorMenuBar :editor="editor" />
    <v-divider thickness="2" />
    <ClientOnly>
      <EditorContent :editor="editor" />
    </ClientOnly>
    <RichTextEditorFooterBar v-if="slots['prepend-footer'] || slots['append-footer']" :editor="editor">
      <template #prepend="editorProps">
        <slot name="prepend-footer" :="editorProps" />
      </template>
      <template #append="editorProps">
        <slot name="append-footer" :="editorProps" />
      </template>
    </RichTextEditorFooterBar>
  </StyledCard>
</template>

<style scoped lang="scss">
:deep(.ProseMirror) {
  padding: 1rem;
  height: 15rem;
  overflow-y: auto;
  outline: none;

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
