import type { NoteResource } from "#shared/models/resource/note/NoteResource";

import { EMPTY_NOTE_DOC } from "#shared/models/resource/note/NoteResource";
import { getRouteParamString } from "@/util/router/getRouteParamString";

export const useNoteStore = defineStore("note", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, resource, save, setPersistedContent } = useResource(() =>
    getRouteParamString(route.params.id),
  );
  const note = ref<NoteResource>({ doc: EMPTY_NOTE_DOC });
  const loadContent = async () => {
    await load();
    // Content is untyped at the cross-type dispatch; this store owns the concrete schema
    const data = (await readContent()) as NoteResource | undefined;
    note.value = data ?? { doc: EMPTY_NOTE_DOC };
    // Seed the dirty check so the editor's load echo compares equal instead of writing back
    setPersistedContent(note.value);
  };
  const saveNote = () => save(note.value);
  return { loadContent, note, resource, saveNote };
});
