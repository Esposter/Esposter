import type { History } from "@esposter/shared";
import type { ShallowRef, WritableComputedRef } from "vue";

// What an editing session hands its store: the history, a commit that sets it with the document, a load that starts afresh, and the
// Selected node's pointer
export interface EditSession<TDocument, TEntry> {
  commit: (newDocument: TDocument, newHistory: History<TEntry>) => void;
  history: ShallowRef<History<TEntry>>;
  load: (newDocument: TDocument) => void;
  selectedPointer: WritableComputedRef<string>;
}
