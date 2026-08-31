import type { ResourceType } from "@esposter/db-schema";

import { EMPTY_NOTE_DOC } from "#shared/models/resource/note/NoteResource";
import { createContentData } from "@/services/resource/createContentData";

export const useNoteStore = defineStore("resource/note", () => {
  const {
    content: note,
    loadContent,
    saveContent: saveNote,
  } = createContentData<ResourceType.Note>((data) => data ?? { doc: EMPTY_NOTE_DOC });
  return { loadContent, note, saveNote };
});
