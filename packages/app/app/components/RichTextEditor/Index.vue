<script setup lang="ts">
import type { FooterBarAppendSlotProps, FooterBarPrependSlotProps } from "@/components/RichTextEditor/FooterBar.vue";
import type { AnyExtension } from "@tiptap/vue-3";
import type { VCard } from "vuetify/components";

import { type FileHandlePluginOptions, FileHandler } from "@tiptap/extension-file-handler";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";

interface RichTextEditorProps {
  cardProps?: VCard["$props"];
  extensions?: AnyExtension[];
  height?: string;
  limit: number;
  placeholder?: string;
}

const slots = defineSlots<{
  "append-footer": (props: FooterBarAppendSlotProps) => unknown;
  "prepend-footer": (props: FooterBarPrependSlotProps) => unknown;
  "prepend-inner-header": (props: Record<string, never>) => unknown;
  "prepend-outer-footer": (props: Record<string, never>) => unknown;
}>();
const modelValue = defineModel<string>({ required: true });
const {
  cardProps,
  extensions,
  height = "auto",
  limit,
  placeholder = "Text (optional)",
} = defineProps<RichTextEditorProps>();
const emit = defineEmits<{ paste: Parameters<NonNullable<FileHandlePluginOptions["onPaste"]>> }>();
const editor = useEditor({
  content: modelValue.value,
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder }),
    CharacterCount.configure({ limit }),
    FileHandler.configure({
      onPaste: (...args) => emit("paste", ...args),
    }),
    ...(extensions ?? []),
  ],
  onUpdate: ({ editor }) => {
    modelValue.value = editor.getHTML();
  },
});
// @TODO: https://github.com/ueberdosis/tiptap/issues/1044
watch(
  [() => placeholder, () => limit],
  ([newPlaceholder, newLimit]) => {
    if (!editor.value) return;

    for (const { name, options } of editor.value.extensionManager.extensions)
      if (name === Placeholder.name) options.placeholder = newPlaceholder;
      else if (name === CharacterCount.name) options.limit = newLimit;

    editor.value.setOptions();
  },
  { flush: "post" },
);

onUnmounted(() => editor.value?.destroy());
</script>

<template>
  <div flex flex-col w-full>
    <StyledCard :card-props>
      <RichTextEditorMenuBar :editor />
      <v-divider thickness="2" />
      <slot name="prepend-inner-header" />
      <EditorContent :editor />
      <RichTextEditorFooterBar :editor>
        <template #prepend="editorProps">
          <slot name="prepend-footer" :="editorProps" />
          <RichTextEditorCustomEmojiPickerButton :editor="editorProps.editor" />
        </template>
        <template #append="editorProps">
          <slot name="append-footer" :="editorProps" />
        </template>
      </RichTextEditorFooterBar>
    </StyledCard>
    <div flex justify-between px-1 pt-1>
      <slot name="prepend-outer-footer">&nbsp;</slot>
      <v-counter :value="editor?.storage.characterCount.characters()" :max="limit" :active="editor?.isFocused" />
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.ProseMirror) {
  padding: 1rem 1rem 0 1rem;
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
