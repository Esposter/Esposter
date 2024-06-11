<script setup lang="ts">
import type { FooterBarAppendSlotProps, FooterBarPrependSlotProps } from "@/components/RichTextEditor/FooterBar.vue";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";
import type { AnyExtension } from "@tiptap/vue-3";
import { EditorContent, useEditor } from "@tiptap/vue-3";

interface RichTextEditorProps {
  height?: string;
  placeholder: string;
  limit: number;
  extensions?: AnyExtension[];
}

const modelValue = defineModel<string>({ required: true });
const { height = "15rem", placeholder, limit, extensions } = defineProps<RichTextEditorProps>();
const slots = defineSlots<{
  "prepend-footer": (props: FooterBarPrependSlotProps) => unknown;
  "append-footer": (props: FooterBarAppendSlotProps) => unknown;
}>();
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder }),
    CharacterCount.configure({ limit }),
    Link,
    ...(extensions ?? []),
  ],
  content: modelValue.value,
  onUpdate: ({ editor }) => {
    modelValue.value = editor.getHTML();
  },
});

onUnmounted(() => editor.value?.destroy());
</script>

<template>
  <div flex flex-col w-full>
    <StyledCard>
      <RichTextEditorMenuBar :editor="editor" />
      <v-divider thickness="2" />
      <EditorContent :editor="editor" />
      <RichTextEditorFooterBar v-if="slots['prepend-footer'] || slots['append-footer']" :editor="editor">
        <template #prepend="editorProps">
          <slot name="prepend-footer" :="editorProps" />
        </template>
        <template #append="editorProps">
          <slot name="append-footer" :="editorProps" />
        </template>
      </RichTextEditorFooterBar>
    </StyledCard>
    <div flex justify-end pt-2 pr-4 h-6.5>
      <v-counter :value="editor?.storage.characterCount.characters()" :max="limit" :active="editor?.isFocused" />
    </div>
  </div>
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
