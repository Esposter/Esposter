<script setup lang="ts">
import { CharacterCount } from "@tiptap/extension-character-count";
import { Placeholder } from "@tiptap/extension-placeholder";
import { StarterKit } from "@tiptap/starter-kit";
import type { KeyboardShortcutCommand } from "@tiptap/vue-3";
import { EditorContent, Extension, useEditor } from "@tiptap/vue-3";

interface RichTextEditorProps {
  modelValue: string;
  placeholder: string;
  maxLength: number;
  onEnter?: KeyboardShortcutCommand;
}

const props = defineProps<RichTextEditorProps>();
const { modelValue, placeholder, maxLength, onEnter } = toRefs(props);
const emit = defineEmits<{
  (event: "update:model-value", value: string): void;
}>();
const extensions = computed(() => {
  const result: Extension[] = [
    StarterKit,
    Placeholder.configure({ placeholder: placeholder.value }),
    CharacterCount.configure({ limit: maxLength.value }),
  ];
  if (!onEnter?.value) return result;

  result.push(
    new Extension({
      addKeyboardShortcuts() {
        return {
          Enter: () => {
            if (!onEnter.value) return true;
            return onEnter.value({ editor: this.editor });
          },
        };
      },
    })
  );
  return result;
});
const editor = useEditor({
  extensions: extensions.value,
  content: modelValue.value,
  onUpdate: ({ editor }) => emit("update:model-value", editor.getHTML()),
});

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <StyledCard>
    <RichTextEditorMenuBar :editor="editor">
      <template #append="{ editor: editorProp }">
        <slot name="append-menu" :editor="editorProp" />
      </template>
    </RichTextEditorMenuBar>
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
