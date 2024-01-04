<script setup lang="ts">
import {
  type FooterBarAppendSlotProps,
  type FooterBarPrependSlotProps,
} from "@/components/RichTextEditor/FooterBar.vue";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";
import { EditorContent, useEditor, type AnyExtension } from "@tiptap/vue-3";

interface RichTextEditorProps {
  height?: string;
  placeholder: string;
  maxLength: number;
  extensions?: AnyExtension[];
}

const modelValue = defineModel<string>({ required: true });
const { height = "15rem", placeholder, maxLength, extensions } = defineProps<RichTextEditorProps>();
const slots = defineSlots<{
  "prepend-footer": (props: FooterBarPrependSlotProps) => unknown;
  "append-footer": (props: FooterBarAppendSlotProps) => unknown;
}>();
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder }),
    CharacterCount.configure({ limit: maxLength }),
    Link,
    ...(extensions ?? []),
  ],
  content: modelValue.value,
  onUpdate: ({ editor }) => {
    modelValue.value = editor.getHTML();
  },
});

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <StyledCard w-full>
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
  height: v-bind(height);
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
