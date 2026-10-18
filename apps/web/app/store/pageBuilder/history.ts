import type { PageBuilderHistoryEntry } from "@/models/pageBuilder/PageBuilderHistoryEntry";
import type { History, JsonPatchOperation } from "@esposter/shared";
import type { BlockDocument } from "headless-block-editor";

import { MAX_PAGE_BUILDER_HISTORY_SIZE } from "@/services/pageBuilder/constants";
import { getRecordedHistory } from "@/services/pageBuilder/getRecordedHistory";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import {
  createHistory,
  getResult,
  InvalidOperationError,
  noop,
  Operation,
  redoHistory,
  undoHistory,
} from "@esposter/shared";
import { applyBlockEdit } from "headless-block-editor";

// Each open resource's undo and redo over its document in the page builder's document store. An edit is recorded with
// The inverses that undo it, and an edit in the same interaction that overwrites the values the newest entry overwrote
// Merges into that entry, so a drag of a value is one entry
export const usePageBuilderHistoryStore = defineStore("pageBuilder/history", () => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument, setDocument } = pageBuilderDocumentStore;
  const emptyHistory = createHistory<PageBuilderHistoryEntry>(MAX_PAGE_BUILDER_HISTORY_SIZE);
  // Replaced rather than mutated, so every reader of the map is told of each change
  const historyMap = shallowRef(new Map<string, History<PageBuilderHistoryEntry>>());
  const getHistory = (resourceId: string) => historyMap.value.get(resourceId) ?? emptyHistory;
  const setHistory = (resourceId: string, history: History<PageBuilderHistoryEntry>) => {
    historyMap.value = new Map(historyMap.value).set(resourceId, history);
  };
  // The one place a document changes: the operations apply to the document held, or the edit is refused
  const applyOperations = (resourceId: string, operations: JsonPatchOperation[]) =>
    getResult(() => {
      const document = getDocument(resourceId);
      if (!document) throw new InvalidOperationError(Operation.Update, resourceId, "has no document held");
      return document;
    }).andThen((document) => applyBlockEdit(document, operations));
  // The document and the history an edit leaves land together, so neither is ever ahead of the other
  const commitEdit = (resourceId: string, document: BlockDocument, history: History<PageBuilderHistoryEntry>) => {
    setDocument(resourceId, document);
    setHistory(resourceId, history);
  };
  // An undo or a redo moves the history, and the move lands only when the entry's operations apply
  const moveHistory = (
    resourceId: string,
    operations: JsonPatchOperation[],
    history: History<PageBuilderHistoryEntry>,
  ) =>
    applyOperations(resourceId, operations)
      .map(({ document }) => commitEdit(resourceId, document, history))
      .match(noop, console.error);
  const applyEdit = (resourceId: string, operations: JsonPatchOperation[], label: string, interactionId?: string) =>
    applyOperations(resourceId, operations).map(({ document, inverses }) =>
      commitEdit(
        resourceId,
        document,
        getRecordedHistory(getHistory(resourceId), { interactionId, inverses, label, operations }),
      ),
    );
  const clearHistory = (resourceId: string) => {
    setHistory(resourceId, emptyHistory);
  };
  const getRedoLabel = (resourceId: string) => getHistory(resourceId).future[0]?.label || "";
  const getUndoLabel = (resourceId: string) => getHistory(resourceId).past.at(-1)?.label || "";
  const redo = (resourceId: string) => {
    const { entry, history } = redoHistory(getHistory(resourceId));
    if (entry === undefined) return;
    moveHistory(resourceId, entry.operations, history);
  };
  const undo = (resourceId: string) => {
    const { entry, history } = undoHistory(getHistory(resourceId));
    if (entry === undefined) return;
    moveHistory(resourceId, entry.inverses, history);
  };

  return { applyEdit, clearHistory, getRedoLabel, getUndoLabel, historyMap, redo, undo };
});
