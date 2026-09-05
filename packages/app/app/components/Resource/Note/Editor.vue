<script setup lang="ts">
import { getNoteExtensions } from "@/services/resource/note/getNoteExtensions";
import { useNoteStore } from "@/store/resource/note";
import { EditorContent, useEditor } from "@tiptap/vue-3";

const noteStore = useNoteStore();
const { loadContent, saveNote } = noteStore;
const { note } = storeToRefs(noteStore);
await loadContent();
// Tiptap onUpdate fires per keystroke, so writes coalesce on the shared autosave cadence like the other editors
const debouncedSave = useAutosaveFunction(saveNote);
// `useEditor` constructs the editor in onMounted (client-only), so the doc is already loaded by then, and
// Tears it down in its own onBeforeUnmount — nothing here has to
const editor = useEditor({
  content: note.value.doc,
  extensions: getNoteExtensions(),
  onUpdate: ({ editor: updatedEditor }) => {
    note.value.doc = updatedEditor.getJSON();
    debouncedSave();
  },
});
</script>

<template>
  <v-container fluid h-full>
    <StyledCard flex flex-col size-full>
      <ResourceNoteEditorMenuBar :editor />
      <v-divider thickness="2" />
      <EditorContent class="note-editor-content" :editor />
    </StyledCard>
  </v-container>
</template>

<style scoped>
.note-editor-content {
  flex: 1;
  overflow-y: auto;
}
:deep(.ProseMirror) {
  padding: 1rem;
  min-height: 100%;
  outline: none;
}
</style>
