<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { JsonPatchOperation } from "@esposter/shared";
import type { SurveyDocument } from "headless-survey-engine";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiToken } from "@/models/ui/UiToken";
import {
  SURVEY_DESIGN_MODE,
  SURVEY_PREVIEW_MODE,
  SURVEY_TOOLBAR_UNFOLDED_WIDTH,
} from "@/services/resource/survey/constants";
import { useResourceStore } from "@/store/resource";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { getResultAsync, JsonPatchOperationType, toJsonPointer } from "@esposter/shared";
import {
  checkSurveyDocument,
  createSurveyDocument,
  surveyDocumentSchema,
  SurveyNodeType,
} from "headless-survey-engine";

// The whole content and root props of a document, replaced as one edit, so an import or a clear is one history entry
const getReplaceOperations = (replacement: SurveyDocument): JsonPatchOperation[] => [
  { op: JsonPatchOperationType.Replace, path: "/content", value: replacement.content },
  { op: JsonPatchOperationType.Replace, path: "/root/props", value: replacement.root.props },
];
const modeItems: UiMenuItem<string>[] = [
  { title: SURVEY_DESIGN_MODE, value: SURVEY_DESIGN_MODE },
  { title: SURVEY_PREVIEW_MODE, value: SURVEY_PREVIEW_MODE },
];
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument, isPreview, isRedoable, isUndoable } = storeToRefs(surveyCreatorStore);
const { applyEdit, insertNode, redo, undo } = useSurveyCreatorCommands();
const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
const exportJsonFile = useExportJsonFile();
const importJsonFile = useImportJsonFile();
// The switch chooses between the editor and the runner, so a preview is a view of the survey rather than an edit of it
const mode = computed({
  get: () => (isPreview.value ? SURVEY_PREVIEW_MODE : SURVEY_DESIGN_MODE),
  set: (value: string) => {
    isPreview.value = value === SURVEY_PREVIEW_MODE;
  },
});
// Why the last import was refused, named by the path of the fault, and cleared by the next import
const importFault = ref("");
const isClearOpen = ref(false);
const exportSurvey = () => exportJsonFile(resource.value?.name ?? "", surveyDocument.value);
// The file is parsed without reviving dates, since a text that looks like an ISO date is still text to the document schema,
// Then checked against that schema and the survey check, and only a file passing both replaces the survey
const importSurvey = () =>
  importJsonFile(async (file) => {
    importFault.value = "";
    await getResultAsync<unknown>(() => new Response(file).json()).match(
      (json) => {
        const result = surveyDocumentSchema.safeParse(json);
        if (!result.success) {
          const [issue] = result.error.issues;
          importFault.value = `Refused at ${toJsonPointer(issue?.path.map(String) ?? [])}: ${issue?.message ?? ""}`;
          return;
        }

        // The survey check names every refusal in document order, and the first of them is the one shown
        const fault = checkSurveyDocument(result.data).at(0);
        if (fault) {
          importFault.value = `Refused at ${fault.pointer}: ${fault.message}`;
          return;
        }

        if (!applyEdit(getReplaceOperations(result.data), "Import survey"))
          importFault.value = "The survey could not be imported";
      },
      () => {
        importFault.value = "The file is not JSON, so it is not a survey";
      },
    );
  });
const clearSurvey = () => applyEdit(getReplaceOperations(createSurveyDocument()), "Clear survey");
// The toolbar's own width, since a side pane's resize narrows it on a wide screen where the viewport is not. It is zero until
// it is measured, so the row starts folded
const toolbar = useTemplateRef("toolbar");
const { width } = useElementSize(toolbar);
const isFolded = computed(() => width.value < SURVEY_TOOLBAR_UNFOLDED_WIDTH);
// The four actions the row drops when folded, titled as their buttons are and run by the same handlers
const foldedItems = computed<Item[]>(() => [
  {
    meaning: UiIconMeaning.Create,
    onClick: () => {
      insertNode(SurveyNodeType.Page);
    },
    title: "Add page",
  },
  { meaning: UiIconMeaning.Upload, onClick: () => importSurvey(), title: "Import" },
  { meaning: UiIconMeaning.Download, onClick: () => exportSurvey(), title: "Export" },
  {
    meaning: UiIconMeaning.Clear,
    onClick: () => {
      isClearOpen.value = true;
    },
    title: "Clear",
  },
]);
</script>

<template>
  <div flex flex-col gap-2>
    <div ref="toolbar" flex gap-1 items-center>
      <UiIconButton :disabled="!isUndoable" label="Undo" :meaning="UiIconMeaning.Undo" @click="undo()" />
      <UiIconButton :disabled="!isRedoable" label="Redo" :meaning="UiIconMeaning.Redo" @click="redo()" />
      <template v-if="!isFolded">
        <UiButton :variant="UiButtonVariant.Quiet" @click="insertNode(SurveyNodeType.Page)">Add page</UiButton>
        <UiIconButton
          label="Import"
          :meaning="UiIconMeaning.Upload"
          :variant="UiButtonVariant.Quiet"
          @click="importSurvey()"
        />
        <UiIconButton
          label="Export"
          :meaning="UiIconMeaning.Download"
          :variant="UiButtonVariant.Quiet"
          @click="exportSurvey()"
        />
        <UiIconButton
          label="Clear"
          :meaning="UiIconMeaning.Clear"
          :variant="UiButtonVariant.Quiet"
          @click="isClearOpen = true"
        />
      </template>
      <UiOverflowMenu v-else :items="foldedItems" label="Survey actions" />
      <UiToggleGroup v-model="mode" ml-a label="Design or preview" :items="modeItems" />
    </div>
    <UiAlert v-if="importFault" :status="UiToken.Error">{{ importFault }}</UiAlert>
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
