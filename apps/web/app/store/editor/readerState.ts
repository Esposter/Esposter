import type { EditorType } from "@/models/editor/EditorType";
import type { ReaderState } from "vue-editor-layout-headless";

import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

export const useEditorReaderStateStore = defineStore("editor/readerState", () => {
  // Every editor type's reader state, kept with the browser so an editor reopens with the sizes and open regions the reader
  // Left. A stored value that is not a record reads as an empty one, and each entry is read back through the layout's parse
  const readerStateMap = useLocalStorage<Partial<Record<EditorType, ReaderState>>>(
    LocalStorageKey.EditorReaderStates,
    {},
    { mergeDefaults: true },
  );
  const setReaderState = (editorType: EditorType, readerState: ReaderState) => {
    readerStateMap.value[editorType] = readerState;
  };
  return { readerStateMap, setReaderState };
});
