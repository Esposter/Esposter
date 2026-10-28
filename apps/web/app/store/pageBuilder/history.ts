import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { PageBuilderHistoryEntry } from "@/models/pageBuilder/PageBuilderHistoryEntry";
import type { OpenPageBuilderDocument } from "@/store/pageBuilder/document";
import type { History, JsonPatchOperation } from "@esposter/shared";

import { MAX_PAGE_BUILDER_HISTORY_SIZE } from "@/services/pageBuilder/constants";
import { getRecordedHistory } from "@/services/pageBuilder/getRecordedHistory";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { ResourceType } from "@esposter/db-schema";
import { createHistory, getResult, InvalidOperationError, Operation, redoHistory, undoHistory } from "@esposter/shared";
import { applyBlockEdit } from "headless-block-editor";

// The edit a document's operations leave, carrying the document's own type and kind so its commit holds it the same way
const toOpenEdit = <TOpen extends OpenPageBuilderDocument, TEdit>(open: TOpen, edit: TEdit) => ({ ...open, ...edit });
const applyToOpenDocument = <TOpen extends OpenPageBuilderDocument>(open: TOpen, operations: JsonPatchOperation[]) =>
  applyBlockEdit(open.kind.documentSchema, open.document, operations).map((edit) => toOpenEdit(open, edit));

// Each open resource's undo and redo over its document in the page builder's document store. An edit is recorded with
// The inverses that undo it, and an edit in the same interaction that overwrites the values the newest entry overwrote
// Merges into that entry, so a drag of a value is one entry. A webpage and an email are edited and undone the same way
export const usePageBuilderHistoryStore = defineStore("pageBuilder/history", () => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getHeldDocument, getOpenDocument, setDocument, setEmailDocument } = pageBuilderDocumentStore;
  const emptyHistory = createHistory<PageBuilderHistoryEntry>(MAX_PAGE_BUILDER_HISTORY_SIZE);
  // Replaced rather than mutated, so every reader of the map is told of each change
  const historyMap = shallowRef(new Map<string, History<PageBuilderHistoryEntry>>());
  const getHistory = (resourceId: string) => historyMap.value.get(resourceId) ?? emptyHistory;
  const setHistory = (resourceId: string, history: History<PageBuilderHistoryEntry>) => {
    historyMap.value = new Map(historyMap.value).set(resourceId, history);
  };
  // The operations apply to the document under its own type, and the result carries that type and kind with the new
  // Document, so the commit that lands the edit holds it the same way. An edit a document refuses is returned as an error
  const applyOperations = (resourceId: string, operations: JsonPatchOperation[]) =>
    getResult(() => {
      const open = getHeldDocument(resourceId);
      if (!open) throw new InvalidOperationError(Operation.Update, resourceId, "has no document held");
      return open;
    }).andThen((open) => applyToOpenDocument(open, operations));
  // The document an edit in progress would leave, drawn in place of the held one until an edit commits. It enters no
  // History, so a drag of a value previews as it moves and records once when it settles. Only a webpage previews
  const previewMap = shallowRef(new Map<string, WebpageDocument>());
  const getPreview = (resourceId: string) => previewMap.value.get(resourceId);
  const clearPreview = (resourceId: string) => {
    if (!previewMap.value.has(resourceId)) return;

    const previews = new Map(previewMap.value);
    previews.delete(resourceId);
    previewMap.value = previews;
  };
  const setPreview = (resourceId: string, operations: JsonPatchOperation[]) => {
    const open = getOpenDocument(resourceId);
    if (!open) return;

    applyToOpenDocument(open, operations).match(({ document }) => {
      previewMap.value = new Map(previewMap.value).set(resourceId, document);
    }, console.error);
  };
  // The document and the history an edit leaves land together, so neither is ever ahead of the other, and a preview ends
  const commitEdit = (resourceId: string, held: OpenPageBuilderDocument, history: History<PageBuilderHistoryEntry>) => {
    if (held.type === ResourceType.Email) setEmailDocument(resourceId, held.kind, held.document);
    else setDocument(resourceId, held.kind, held.document);
    setHistory(resourceId, history);
    clearPreview(resourceId);
  };
  // An undo or a redo moves the history, and the move lands only when the entry's operations apply
  const moveHistory = (
    resourceId: string,
    operations: JsonPatchOperation[],
    history: History<PageBuilderHistoryEntry>,
  ) => {
    applyOperations(resourceId, operations).match((held) => {
      commitEdit(resourceId, held, history);
    }, console.error);
  };
  const applyEdit = (resourceId: string, operations: JsonPatchOperation[], label: string, interactionId?: string) =>
    applyOperations(resourceId, operations).map(({ inverses, ...held }) => {
      commitEdit(
        resourceId,
        held,
        getRecordedHistory(getHistory(resourceId), { interactionId, inverses, label, operations }),
      );
    });
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
