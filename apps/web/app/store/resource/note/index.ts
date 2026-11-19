import { createEmptyNote } from "#shared/services/resource/note/createEmptyNote";
import { createContentData } from "#src/services/resource/createContentData";
import { ResourceType } from "@esposter/db-schema";

export const useNoteStore = defineStore("resource/note", () => {
  const {
    content: note,
    getContentWriter,
    loadContent,
    saveContent: saveNote,
  } = createContentData<typeof ResourceType.Note>(ResourceType.Note, (data) => data ?? createEmptyNote());
  return { getContentWriter, loadContent, note, saveNote };
});
