<script setup lang="ts">
import type { FooterBarAppendSlotProps, FooterBarPrependSlotProps } from "@/components/RichTextEditor/FooterBar.vue";
import type { AnyExtension } from "@tiptap/vue-3";

import { CharacterCount } from "@tiptap/extension-character-count";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";

interface RichTextEditorProps {
  extensions?: AnyExtension[];
  height?: string;
  limit: number;
  placeholder?: string;
}

const modelValue = defineModel<string>({ required: true });
const { extensions, height = "auto", limit, placeholder = "Text (optional)" } = defineProps<RichTextEditorProps>();
const slots = defineSlots<{
  "append-footer": (props: FooterBarAppendSlotProps) => unknown;
  "prepend-footer": (props: FooterBarPrependSlotProps) => unknown;
}>();
const editor = useEditor({
  content: modelValue.value,
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder }),
    CharacterCount.configure({ limit }),
    Link,
    ...(extensions ?? []),
  ],
  onUpdate: ({ editor }) => {
    modelValue.value = editor.getHTML();
  },
});

onUnmounted(() => editor.value?.destroy());
</script>

<template>
  <div flex flex-col w-full>
    <StyledCard>
      <RichTextEditorMenuBar :editor />
      <v-divider thickness="2" />
      <EditorContent :editor />
      <RichTextEditorFooterBar :editor>
        <template #prepend="editorProps">
          <slot v-if="slots['prepend-footer']" name="prepend-footer" :="editorProps" />
          <RichTextEditorCustomEmojiPickerButton v-else :editor="editorProps.editor" tooltip="Select an emoji" />
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
  max-height: 15rem;
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
