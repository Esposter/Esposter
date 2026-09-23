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

defineSlots<{
  "append-footer": (props: FooterBarSlotProps) => VNode;
  "prepend-footer": (props: FooterBarSlotProps) => VNode;
  "prepend-inner-header": () => VNode;
  "prepend-outer-footer": () => VNode;
}>();
const modelValue = defineModel<string>({ required: true });
const { autofocus = false, extensions, height = "auto", limit, placeholder = "Text (optional)" } = defineProps<Props>();
const emit = defineEmits<{ paste: Parameters<NonNullable<FileHandlePluginOptions["onPaste"]>> }>();
const linkCursorStyle = ref<CSSProperties["cursor"]>("text");
const editor = useEditor({
  autofocus,
  content: modelValue.value,
  extensions: [
    CharacterCount.configure({ limit }),
    // Only onPaste is wired — onDrop is deliberately omitted so file drops fall through to the document-level
    // Dropzone in MessageModelMessageFileDropzoneBackground (useDropZone), which owns drop-to-upload for the whole
    // Room.
    FileHandler.configure({
      onPaste: (...args) => emit("paste", ...args),
    }),
    Placeholder.configure({ placeholder: () => placeholder }),
    StarterKit.configure({ codeBlock: false, link: { openOnClick: false } }),
    useLinkClickExtension(linkCursorStyle),
    ...(extensions ?? []),
  ],
  onUpdate: ({ editor: updatedEditor }) => {
    modelValue.value = updatedEditor.getHTML();
  },
});
// https://github.com/ueberdosis/tiptap/issues/1044
watch([() => placeholder, () => limit], ([newPlaceholder, newLimit]) => {
  if (!editor.value) return;

  for (const { name, options } of editor.value.extensionManager.extensions)
    if (name === Placeholder.name) options.placeholder = newPlaceholder;
    else if (name === CharacterCount.name) options.limit = newLimit;

  editor.value.setOptions();
});
</script>

<template>
  <div flex flex-col gap-1 w-full>
    <!-- Tiptap draws only the document, so the chrome around it is the library's, and what the document holds is
      Themed from outside by the rich text rules -->
    <div flex flex-col ui-frame>
      <RichTextEditorMenuBar :editor />
      <div bg-panel-edge h-1 />
      <slot name="prepend-inner-header" />
      <EditorContent class="rich-text-content" :editor />
      <RichTextEditorFooterBar :editor>
        <template #prepend="editorProps">
          <slot name="prepend-footer" :="editorProps" />
          <RichTextEditorCustomEmojiPickerButton :editor="editorProps.editor" />
        </template>
        <template #append="editorProps">
          <slot name="append-footer" :="editorProps" />
        </template>
      </RichTextEditorFooterBar>
    </div>
    <div text-muted px-1 flex gap-2 justify-between>
      <slot name="prepend-outer-footer">&nbsp;</slot>
      <span v-if="editor?.isFocused">{{ editor.storage.characterCount.characters() }} / {{ limit }}</span>
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
