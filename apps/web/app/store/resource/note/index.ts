import { EMPTY_NOTE_DOC } from "#shared/services/resource/constants";
import { createContentData } from "#src/services/resource/createContentData";
import { ResourceType } from "@esposter/db-schema";

export const useNoteStore = defineStore("resource/note", () => {
  const {
    content: note,
    getContentWriter,
    loadContent,
    saveContent: saveNote,
  } = createContentData<typeof ResourceType.Note>(ResourceType.Note, (data) => data ?? { doc: EMPTY_NOTE_DOC });
  return { getContentWriter, loadContent, note, saveNote };
});
