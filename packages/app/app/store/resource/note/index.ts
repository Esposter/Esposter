import type { NoteResource } from "#shared/models/resource/note/NoteResource";
import type { ResourceType } from "@esposter/db-schema";

import { EMPTY_NOTE_DOC } from "#shared/models/resource/note/NoteResource";
import { useResourceStore } from "@/store/resource";

export const useNoteStore = defineStore("note", () => {
  const resourceStore = useResourceStore();
  const { readContent, readResource, saveContent, setPersistedContent } = resourceStore;
  const note = ref<NoteResource>({ doc: EMPTY_NOTE_DOC });
  const loadContent = async () => {
    await readResource();
    const data = await readContent<ResourceType.Note>();
    note.value = data ?? { doc: EMPTY_NOTE_DOC };
    // Seed the dirty check so the editor's load echo compares equal instead of writing back
    setPersistedContent(note.value);
  };
  const saveNote = () => saveContent(note.value);
  return { loadContent, note, saveNote };
});
