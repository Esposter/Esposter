import type { EditSession } from "#src/models/EditSession";
import type { EditSessionSelection } from "#src/models/EditSessionSelection";
import type { History } from "@esposter/shared";
import type { Ref } from "vue";

import { createHistory } from "@esposter/shared";
import { computed, ref, shallowRef, watch } from "vue";

// An editing session over one document: the document and its undo history, which a commit sets together, and a selected node
// Held by id, so an edit that moves the node keeps it selected. The caller owns the document's ref, and the history is cleared
// Whenever that ref is set from outside a commit, so a load that replaces the document starts a fresh history on its own
export const useEditSession = <TDocument, TEntry>(
  document: Ref<TDocument>,
  historyLimit: number,
  selection?: EditSessionSelection<TDocument>,
): EditSession<TDocument, TEntry> => {
  // A shallow ref, so the history's entries are held as they were written, never wrapped in a reactive proxy
  const history = shallowRef(createHistory<TEntry>(historyLimit));
  const selectedId = ref("");
  // Synchronous, so the history is cleared before a commit sets its own, rather than after it
  watch(
    document,
    () => {
      history.value = createHistory<TEntry>(historyLimit);
    },
    { flush: "sync" },
  );
  const commit = (newDocument: TDocument, newHistory: History<TEntry>) => {
    document.value = newDocument;
    history.value = newHistory;
  };
  // A selection with nothing to read it from, as a document without addressable nodes has, reads as nothing selected
  const selectedPointer = computed({
    get: () => selection?.getPointerById(document.value, selectedId.value) ?? "",
    set: (nodePointer: string) => {
      selectedId.value = selection?.getIdByPointer(document.value, nodePointer) ?? "";
    },
  });
  // A loaded document has nothing selected and nothing to undo, since its history is the one it was opened with
  const load = (newDocument: TDocument) => {
    commit(newDocument, createHistory<TEntry>(historyLimit));
    selectedId.value = "";
  };

  return { commit, history, load, selectedPointer };
};
