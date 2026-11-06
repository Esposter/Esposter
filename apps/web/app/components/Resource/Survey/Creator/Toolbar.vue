<script setup lang="ts">
import type { EditorToolbarGroup } from "@/models/editor/EditorToolbarGroup";
import type { JsonPatchOperation } from "@esposter/shared";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { EditorToolbarGroupKind } from "@/models/editor/EditorToolbarGroupKind";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { importJsonFile } from "@/services/file/importJsonFile";
import { SURVEY_DESIGN_MODE, SURVEY_PREVIEW_MODE } from "@/services/resource/survey/constants";
import { getSurveyNodeLabel } from "@/services/resource/survey/getSurveyNodeLabel";
import { getSurveyNodePointerById } from "@/services/resource/survey/getSurveyNodePointerById";
import { HISTORY_REDO_SHORTCUT, HISTORY_UNDO_SHORTCUT } from "@/services/ui/constants";
import { useAlertStore } from "@/store/alert";
import { useResourceStore } from "@/store/resource";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { getResultAsync, JsonPatchOperationType, toJsonPointer } from "@esposter/shared";
import { getBlockNode } from "vue-block-editor-headless";
import {
  checkSurveyDocument,
  createSurveyDocument,
  surveyDocumentSchema,
  SurveyNodeType,
  surveyNodeChildren,
} from "vue-survey-engine-headless";

// The whole content and root props of a document, replaced as one edit, so an import or a clear is one history entry
const getReplaceOperations = (replacement: SurveyDocument): JsonPatchOperation[] => [
  { op: JsonPatchOperationType.Replace, path: "/content", value: replacement.content },
  { op: JsonPatchOperationType.Replace, path: "/root/props", value: replacement.root.props },
];
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument, isPreview, isRedoable, isUndoable } = storeToRefs(surveyCreatorStore);
const { applyEdit, insertNode, redo, select, undo } = useSurveyCreatorCommands();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
const exportJsonFile = useExportJsonFile();
const findings = useSurveyCreatorFindings();
const isClearOpen = ref(false);
// The switch chooses between the editor and the runner, so a preview is a view of the survey rather than an edit of it
const mode = computed({
  get: () => (isPreview.value ? SURVEY_PREVIEW_MODE : SURVEY_DESIGN_MODE),
  set: (value: string) => {
    isPreview.value = value === SURVEY_PREVIEW_MODE;
  },
});
const exportSurvey = () => exportJsonFile(resource.value?.name ?? "", surveyDocument.value);
// The file is parsed without reviving dates, since a text that looks like an ISO date is still text to the document schema,
// Then checked against that schema and the survey check, and only a file passing both replaces the survey. A refusal is an
// Alert, since the bar has no room for a line of text
const importSurvey = () =>
  importJsonFile(async (file) => {
    await getResultAsync<unknown>(() => new Response(file).json()).match(
      (json) => {
        const result = surveyDocumentSchema.safeParse(json);
        if (!result.success) {
          const [issue] = result.error.issues;
          createAlert(`Refused at ${toJsonPointer(issue?.path.map(String) ?? [])}: ${issue?.message ?? ""}`, "error");
          return;
        }

        // The survey check names every refusal in document order, and the first of them is the one shown
        const fault = checkSurveyDocument(result.data).at(0);
        if (fault) {
          createAlert(`Refused at ${fault.pointer}: ${fault.message}`, "error");
          return;
        }

        if (!applyEdit(getReplaceOperations(result.data), "Import survey"))
          createAlert("The survey could not be imported", "error");
      },
      () => {
        createAlert("The file is not JSON, so it is not a survey", "error");
      },
    );
  });
const clearSurvey = () => applyEdit(getReplaceOperations(createSurveyDocument()), "Clear survey");
// The name a problem's row gives its node, which is the survey as a whole for a problem that no node holds
const getNodeTitle = (nodeId: string) => {
  const nodePointer = getSurveyNodePointerById(surveyDocument.value, nodeId);
  const node = getBlockNode(surveyDocument.value, nodePointer, surveyNodeChildren);
  return node ? getSurveyNodeLabel(node) : "The survey";
};
// The bar's items in the order it draws them. Undo, redo and Add page are pinned, so they stay in the bar at any width, and
// Import, Export and Clear are always in its overflow menu
const groups = computed<EditorToolbarGroup[]>(() => [
  {
    items: [
      {
        description: isUndoable.value ? undefined : "Nothing to undo",
        isDisabled: !isUndoable.value,
        isPinned: true,
        meaning: UiIconMeaning.Undo,
        onClick: () => undo(),
        shortcut: HISTORY_UNDO_SHORTCUT,
        title: "Undo",
        value: "undo",
      },
      {
        description: isRedoable.value ? undefined : "Nothing to redo",
        isDisabled: !isRedoable.value,
        isPinned: true,
        meaning: UiIconMeaning.Redo,
        onClick: () => redo(),
        shortcut: HISTORY_REDO_SHORTCUT,
        title: "Redo",
        value: "redo",
      },
    ],
    kind: EditorToolbarGroupKind.Command,
    label: "History",
  },
  {
    items: [
      {
        isPinned: true,
        meaning: UiIconMeaning.Create,
        onClick: () => {
          insertNode(SurveyNodeType.Page);
        },
        title: "Add page",
        value: "addPage",
      },
    ],
    kind: EditorToolbarGroupKind.Command,
    label: "Pages",
  },
  {
    items: [
      { isPinned: true, meaning: UiIconMeaning.Edit, title: SURVEY_DESIGN_MODE, value: SURVEY_DESIGN_MODE },
      { isPinned: true, meaning: UiIconMeaning.Show, title: SURVEY_PREVIEW_MODE, value: SURVEY_PREVIEW_MODE },
    ],
    kind: EditorToolbarGroupKind.Tool,
    label: "Design or preview",
  },
  {
    items: [
      {
        isInOverflow: true,
        meaning: UiIconMeaning.Upload,
        onClick: () => importSurvey(),
        title: "Import",
        value: "import",
      },
      {
        isInOverflow: true,
        meaning: UiIconMeaning.Download,
        onClick: () => exportSurvey(),
        title: "Export",
        value: "export",
      },
      {
        isInOverflow: true,
        meaning: UiIconMeaning.Clear,
        onClick: () => {
          isClearOpen.value = true;
        },
        title: "Clear",
        value: "clear",
      },
    ],
    kind: EditorToolbarGroupKind.Command,
    label: "Survey file",
  },
]);
</script>

<template>
  <div flex gap-1 items-center min-w-0>
    <EditorToolbar v-model="mode" label="Survey actions" :groups flex-1 />
    <EditorProblems
      :findings
      :get-node-title="getNodeTitle"
      @select="
        (nodeId) => {
          const nodePointer = getSurveyNodePointerById(surveyDocument, nodeId);
          if (nodePointer) select(nodePointer);
        }
      "
    />
    <UiConfirmDialog
      v-model="isClearOpen"
      confirm-label="Clear"
      :confirm="() => clearSurvey()"
      is-optimistic
      title="Clear survey"
    >
      <p>Replace every page of this survey with an empty one? Undo brings it back.</p>
    </UiConfirmDialog>
  </div>
</template>
