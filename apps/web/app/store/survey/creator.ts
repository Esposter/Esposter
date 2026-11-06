import type { PageBuilderHistoryEntry } from "@/models/pageBuilder/PageBuilderHistoryEntry";
import type { SurveyDocument } from "headless-survey-engine";

import { MAX_PAGE_BUILDER_HISTORY_SIZE } from "@/services/pageBuilder/constants";
import { getSurveyNodePointerById } from "@/services/resource/survey/getSurveyNodePointerById";
import { getBlockNode, useEditSession } from "vue-block-editor-headless";
import { createSurveyDocument, surveyNodeChildren } from "headless-survey-engine";

// The creator's document, its selection and its undo history. The selection is the session's, held by the selected node's id
// Rather than its pointer, so an edit or an undo that moves the node keeps it selected
export const useSurveyCreatorStore = defineStore("survey/creator", () => {
  const document = ref<SurveyDocument>(createSurveyDocument());
  const { commit, history, load, selectedPointer } = useEditSession<SurveyDocument, PageBuilderHistoryEntry>(
    document,
    MAX_PAGE_BUILDER_HISTORY_SIZE,
    {
      getIdByPointer: (surveyDocument, nodePointer) =>
        getBlockNode(surveyDocument, nodePointer, surveyNodeChildren)?.props.id ?? "",
      getPointerById: getSurveyNodePointerById,
    },
  );
  const isPreview = ref(false);
  const selectedNode = computed(() => getBlockNode(document.value, selectedPointer.value, surveyNodeChildren));
  const isRedoable = computed(() => history.value.future.length > 0);
  const isUndoable = computed(() => history.value.past.length > 0);

  return { commit, document, history, isPreview, isRedoable, isUndoable, load, selectedNode, selectedPointer };
});
