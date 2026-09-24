<script setup lang="ts">
import { getNoteExtensions } from "@/services/resource/note/getNoteExtensions";
import { useNoteStore } from "@/store/resource/note";
import { ResourceType } from "@esposter/db-schema";
import { EditorContent, useEditor } from "@tiptap/vue-3";

const noteStore = useNoteStore();
const { loadContent, saveNote } = noteStore;
const { note } = storeToRefs(noteStore);
await loadContent();
// Tiptap onUpdate fires per keystroke, so writes coalesce on the shared autosave cadence like the other editors
const debouncedSave = useAutosaveFunction(saveNote);
// `useEditor` constructs the editor in onMounted, which is after the load above, so the doc is already there
const editor = useEditor({
  content: note.value.doc,
  extensions: getNoteExtensions(),
  onUpdate: ({ editor: updatedEditor }) => {
    note.value.doc = updatedEditor.getJSON();
    debouncedSave();
  },
});
// Tiptap owns the live document from construction on, so the store's re-read alone leaves it holding the
// Pre-restore doc — and its next keystroke would write that doc back. Silently, because an update emitted
// Here is the restore echoing back out as an edit
useAdoptResourceContent(ResourceType.Note, () => {
  editor.value?.commands.setContent(note.value.doc, { emitUpdate: false });
});
</script>

<template>
  <div p-4 h-full>
    <div flex flex-col size-full ui-frame>
      <ResourceNoteEditorMenuBar :editor ui-bar />
      <EditorContent flex-1 of-y-auto :editor />
    </div>
  </div>
</template>

<style scoped>
:deep(.ProseMirror) {
  padding: 1rem;
  min-height: 100%;
  outline: none;
}
</style>
