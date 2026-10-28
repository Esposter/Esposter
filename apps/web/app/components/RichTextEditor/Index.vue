<script setup lang="ts">
import type { FooterBarSlotProps } from "@/components/RichTextEditor/FooterBarSlotProps";
import type { FileHandlePluginOptions } from "@tiptap/extension-file-handler";
import type { AnyExtension, FocusPosition } from "@tiptap/vue-3";
import type { CSSProperties } from "vue";

import { FileHandler } from "@tiptap/extension-file-handler";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";

interface Props {
  autofocus?: FocusPosition;
  extensions?: AnyExtension[];
  height?: string;
  limit: number;
  placeholder?: string;
}

const slots = defineSlots<{
  "append-footer": (props: FooterBarSlotProps) => VNode;
  "prepend-footer": (props: FooterBarSlotProps) => VNode;
  "prepend-inner-header": () => VNode;
  "prepend-outer-footer"?: () => VNode;
}>();
const modelValue = defineModel<string>({ required: true });
const { autofocus = false, extensions, height = "auto", limit, placeholder = "Text (optional)" } = defineProps<Props>();
const emit = defineEmits<{ paste: Parameters<NonNullable<FileHandlePluginOptions["onPaste"]>> }>();
const linkCursorStyle = ref<CSSProperties["cursor"]>("text");
// CharacterCount copies its options into the plugin it builds, so a limit given at mount stays the limit. Its plugin is
// built here with the limit read through a getter, which follows the prop after mount
const characterCount = CharacterCount.extend({
  addProseMirrorPlugins() {
    return (
      CharacterCount.config.addProseMirrorPlugins?.call({
        ...this,
        options: {
          ...this.options,
          get limit() {
            return limit;
          },
        },
      }) ?? []
    );
  },
}).configure({ limit });
const editor = useEditor({
  autofocus,
  content: modelValue.value,
  extensions: [
    characterCount,
    // Only onPaste is wired — onDrop is deliberately omitted so file drops fall through to the document-level
    // Dropzone in MessageModelMessageFileDropzoneBackground (useDropZone), which owns drop-to-upload for the whole
    // Room.
    FileHandler.configure({ onPaste: (...args) => emit("paste", ...args) }),
    Placeholder.configure({ placeholder: () => placeholder }),
    StarterKit.configure({ codeBlock: false, link: { openOnClick: false } }),
    useLinkClickExtension(linkCursorStyle),
    ...(extensions ?? []),
  ],
  onUpdate: ({ editor: updatedEditor }) => {
    modelValue.value = updatedEditor.getHTML();
  },
});
// The placeholder is a function that reads the prop, so a new one needs only a view update, which setOptions triggers
watch(
  () => placeholder,
  () => {
    if (!editor.value) return;

    editor.value.setOptions();
  },
);
</script>

<template>
  <div flex flex-col gap-1 w-full>
    <!-- Tiptap draws only the document, so the chrome around it is the library's — drawn as a frame, as every
      composite is, with its menu bar across the top — and what the document holds is themed from outside by the rich
      text rules -->
    <div flex flex-col ui-frame>
      <RichTextEditorMenuBar :editor />
      <RichTextEditorSuggestions :editor />
      <slot name="prepend-inner-header" />
      <EditorContent class="rich-text-content" :editor />
      <RichTextEditorFooterBar :editor>
        <template #prepend="editorProps">
          <slot name="prepend-footer" :="editorProps" />
          <RichTextEditorCustomEmojiPickerButton :editor="editorProps.editor" />
        </template>
        <template #append="editorProps">
          <span v-if="editor?.isFocused" text-sm text-muted>
            {{ editor.storage.characterCount.characters() }} / {{ limit }}
          </span>
          <slot name="append-footer" :="editorProps" />
        </template>
      </RichTextEditorFooterBar>
    </div>
    <div v-if="slots['prepend-outer-footer']" text-muted px-1>
      <slot name="prepend-outer-footer" />
    </div>
  </div>
</template>

<style scoped>
:deep(.ProseMirror) {
  padding: 1rem 1rem 0 1rem;
  height: v-bind(height);
  max-height: 15rem;
  overflow-y: auto;
  outline: none;

  p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    height: 0;
    float: left;
    color: var(--ui-muted);
    pointer-events: none;
  }

  a {
    cursor: v-bind(linkCursorStyle);
  }
}
</style>
