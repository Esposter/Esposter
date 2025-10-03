<script setup lang="ts">
import type { FooterBarAppendSlotProps, FooterBarPrependSlotProps } from "@/components/RichTextEditor/FooterBar.vue";
import type { FileHandlePluginOptions } from "@tiptap/extension-file-handler";
import type { AnyExtension } from "@tiptap/vue-3";
import type { CSSProperties } from "vue";
import type { VCard } from "vuetify/components";

import { FileHandler } from "@tiptap/extension-file-handler";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { Plugin } from "prosemirror-state";

interface RichTextEditorProps {
  cardProps?: VCard["$props"];
  extensions?: AnyExtension[];
  height?: string;
  limit: number;
  placeholder?: string;
}

const slots = defineSlots<{
  "append-footer": (props: FooterBarAppendSlotProps) => VNode;
  "prepend-footer": (props: FooterBarPrependSlotProps) => VNode;
  "prepend-inner-header": () => VNode;
  "prepend-outer-footer": () => VNode;
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
const linkCursorStyle = ref<CSSProperties["cursor"]>("text");
const editor = useEditor({
  content: modelValue.value,
  extensions: [
    CharacterCount.configure({ limit }),
    FileHandler.configure({
      onPaste: (...args) => emit("paste", ...args),
    }),
    Placeholder.configure({ placeholder: () => placeholder }),
    StarterKit.configure({
      link: {
        // @ts-expect-error We can hijack the options property for our own purposes of reactively changing the cursor style
        cursorStyle: linkCursorStyle,
        openOnClick: false,
      },
    }).extend({
      addProseMirrorPlugins() {
        const { editor, options } = this;
        return [
          new Plugin({
            props: {
              handleClick(_view, _pos, event) {
                // Check if Ctrl or Cmd key is pressed
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                const isModifierPressed = event.ctrlKey || event.metaKey;
                // If no modifier key, do nothing and let the editor handle it
                // (e.g., for selecting text).
                if (!isModifierPressed) return false;

                const attrs = editor.getAttributes("link");
                const href = attrs.href;

                if (href) {
                  // If a link is found at the click position, open it
                  window.open(href, "_blank", "noopener noreferrer");
                  // Return true to indicate that we've handled the event
                  return true;
                } else
                  // If no link was found, let the editor continue
                  return false;
              },
              handleDOMEvents: {
                // When the editor loses focus (e.g., user alt-tabs away)
                blur: (_view, _event) => {
                  options.link.cursorStyle.value = "text";
                  return false;
                },
                keydown: (_view, event) => {
                  console.log(options);
                  if (event.key === "Control" || event.key === "Meta") options.link.cursorStyle.value = "pointer";
                  // Return false to allow other plugins to handle the event
                  return false;
                },
                keyup: (_view, event) => {
                  if (event.key === "Control" || event.key === "Meta") options.link.cursorStyle.value = "text";
                  return false;
                },
              },
            },
          }),
        ];
      },
    }),
    ...(extensions ?? []),
  ],
  onUpdate: ({ editor }) => {
    modelValue.value = editor.getHTML();
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
      <!-- Add &nbsp; to avoid layout shift -->
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

  a {
    cursor: v-bind(linkCursorStyle);
  }
}
</style>
