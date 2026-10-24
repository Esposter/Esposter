import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { PageBuilderHistoryEntry } from "@/models/pageBuilder/PageBuilderHistoryEntry";
import type { WebpageKind } from "@/models/pageBuilder/WebpageKind";
import type { History, JsonPatchOperation } from "@esposter/shared";

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
  const { getOpenDocument, setDocument } = pageBuilderDocumentStore;
  const emptyHistory = createHistory<PageBuilderHistoryEntry>(MAX_PAGE_BUILDER_HISTORY_SIZE);
  // Replaced rather than mutated, so every reader of the map is told of each change
  const historyMap = shallowRef(new Map<string, History<PageBuilderHistoryEntry>>());
  const getHistory = (resourceId: string) => historyMap.value.get(resourceId) ?? emptyHistory;
  const setHistory = (resourceId: string, history: History<PageBuilderHistoryEntry>) => {
    historyMap.value = new Map(historyMap.value).set(resourceId, history);
  };
  // The one place a document changes: the operations apply to the document held under its kind, or the edit is refused.
  // The kind travels with the result, so the commit that lands the edit holds the document under the same kind
  const applyOperations = (resourceId: string, operations: JsonPatchOperation[]) =>
    getResult(() => {
      const open = getOpenDocument(resourceId);
      if (!open) throw new InvalidOperationError(Operation.Update, resourceId, "has no document held");
      return open;
    }).andThen(({ document, kind }) =>
      applyBlockEdit(kind.documentSchema, document, operations).map((edit) => ({ ...edit, kind })),
    );
  // The document an edit in progress would leave, drawn in place of the held one until an edit commits. It enters no
  // History, so a drag of a value previews as it moves and records once when it settles
  const previewMap = shallowRef(new Map<string, WebpageDocument>());
  const getPreview = (resourceId: string) => previewMap.value.get(resourceId);
  const clearPreview = (resourceId: string) => {
    if (!previewMap.value.has(resourceId)) return;

    const previews = new Map(previewMap.value);
    previews.delete(resourceId);
    previewMap.value = previews;
  };
  const setPreview = (resourceId: string, operations: JsonPatchOperation[]) => {
    applyOperations(resourceId, operations).match(({ document }) => {
      previewMap.value = new Map(previewMap.value).set(resourceId, document);
    }, console.error);
  };
  // The document and the history an edit leaves land together, so neither is ever ahead of the other, and a preview ends
  const commitEdit = (
    resourceId: string,
    kind: WebpageKind,
    document: WebpageDocument,
    history: History<PageBuilderHistoryEntry>,
  ) => {
    setDocument(resourceId, kind, document);
    setHistory(resourceId, history);
    clearPreview(resourceId);
  };
  // An undo or a redo moves the history, and the move lands only when the entry's operations apply
  const moveHistory = (
    resourceId: string,
    operations: JsonPatchOperation[],
    history: History<PageBuilderHistoryEntry>,
  ) =>
    applyOperations(resourceId, operations)
      .map(({ document, kind }) => commitEdit(resourceId, kind, document, history))
      .match(noop, console.error);
  const applyEdit = (resourceId: string, operations: JsonPatchOperation[], label: string, interactionId?: string) =>
    applyOperations(resourceId, operations).map(({ document, inverses, kind }) =>
      commitEdit(
        resourceId,
        kind,
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

  return { applyEdit, clearHistory, getPreview, getRedoLabel, getUndoLabel, historyMap, redo, setPreview, undo };
});
