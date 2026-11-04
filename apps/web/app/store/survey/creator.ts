import type { PageBuilderHistoryEntry } from "@/models/pageBuilder/PageBuilderHistoryEntry";
import type { History } from "@esposter/shared";
import type { SurveyDocument } from "headless-survey-engine";

import { MAX_PAGE_BUILDER_HISTORY_SIZE } from "@/services/pageBuilder/constants";
import { createHistory } from "@esposter/shared";
import { getBlockLayerRows, getBlockNode } from "headless-block-editor";
import { createSurveyDocument, surveyNodeChildren } from "headless-survey-engine";

// The pointer of the node an id names, read off the document's rows in layer order, or nothing when no node holds the id
const getNodePointerById = (document: SurveyDocument, id: string) =>
  getBlockLayerRows(document, surveyNodeChildren).find(
    ({ nodePointer }) => getBlockNode(document, nodePointer, surveyNodeChildren)?.props.id === id,
  )?.nodePointer ?? "";

// The creator's document, its selection and its undo history. The selection holds the selected node's id rather than its
// Pointer, so an edit or an undo that moves the node keeps it selected, and the pointer is read off the document as it stands
export const useSurveyCreatorStore = defineStore("survey/creator", () => {
  const document = ref<SurveyDocument>(createSurveyDocument());
  const history = shallowRef(createHistory<PageBuilderHistoryEntry>(MAX_PAGE_BUILDER_HISTORY_SIZE));
  const isPreview = ref(false);
  const selectedId = ref("");
  const selectedPointer = computed({
    get: () => getNodePointerById(document.value, selectedId.value),
    set: (pointer: string) => {
      selectedId.value = getBlockNode(document.value, pointer, surveyNodeChildren)?.props.id ?? "";
    },
  });
  const selectedNode = computed(() => getBlockNode(document.value, selectedPointer.value, surveyNodeChildren));
  const isRedoable = computed(() => history.value.future.length > 0);
  const isUndoable = computed(() => history.value.past.length > 0);
  // The document and the history an edit leaves land together, so neither is ever ahead of the other
  const commit = (newDocument: SurveyDocument, newHistory: History<PageBuilderHistoryEntry>) => {
    document.value = newDocument;
    history.value = newHistory;
  };
  // A loaded survey has nothing selected and nothing to undo, since its history is the one it was opened with
  const load = (newDocument: SurveyDocument) => {
    commit(newDocument, createHistory<PageBuilderHistoryEntry>(MAX_PAGE_BUILDER_HISTORY_SIZE));
    selectedId.value = "";
  };

  return { commit, document, history, isPreview, isRedoable, isUndoable, load, selectedNode, selectedPointer };
});
