<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { JsonPatchOperation } from "@esposter/shared";
import type { SurveyDocument } from "survey-engine";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiToken } from "@/models/ui/UiToken";
import { useResourceStore } from "@/store/resource";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { JsonPatchOperationType, toJsonPointer } from "@esposter/shared";
import { checkSurveyDocument, createSurveyDocument, SurveyNodeType, surveyDocumentSchema } from "survey-engine";

// The whole content and root props of a document, replaced as one edit, so an import or a clear is one history entry
const getReplaceOperations = (replacement: SurveyDocument): JsonPatchOperation[] => [
  { op: JsonPatchOperationType.Replace, path: "/content", value: replacement.content },
  { op: JsonPatchOperationType.Replace, path: "/root/props", value: replacement.root.props },
];
const DESIGN_MODE = "Design";
const PREVIEW_MODE = "Preview";
const modeItems: UiMenuItem<string>[] = [
  { title: DESIGN_MODE, value: DESIGN_MODE },
  { title: PREVIEW_MODE, value: PREVIEW_MODE },
];
const surveyCreatorStore = useSurveyCreatorStore();
const { canRedo, canUndo, document: surveyDocument, isPreview } = storeToRefs(surveyCreatorStore);
const { applyEdit, insertNode, redo, undo } = useSurveyCreatorCommands();
const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
const exportJsonFile = useExportJsonFile();
const importJsonFile = useImportJsonFile();
// The switch chooses between the editor and the runner, so a preview is a view of the survey rather than an edit of it
const mode = computed({
  get: () => (isPreview.value ? PREVIEW_MODE : DESIGN_MODE),
  set: (value: string) => {
    isPreview.value = value === PREVIEW_MODE;
  },
});
// Why the last import was refused, named by the path of the fault, and cleared by the next import
const importFault = ref("");
const isClearOpen = ref(false);
const exportSurvey = () => exportJsonFile(resource.value?.name ?? "", surveyDocument.value);
// The file is parsed, checked against the document schema and then the survey check, and only a file passing both replaces the survey
const importSurvey = () =>
  importJsonFile(async (file) => {
    importFault.value = "";
    let json: unknown;
    try {
      json = JSON.parse(await file.text());
    } catch {
      importFault.value = "The file is not JSON, so it is not a survey";
      return;
    }

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
  });
const clearSurvey = () => applyEdit(getReplaceOperations(createSurveyDocument()), "Clear survey");
</script>

<template>
  <div flex flex-col gap-2>
    <div flex gap-1 items-center>
      <UiIconButton :disabled="!canUndo" label="Undo" :meaning="UiIconMeaning.Undo" @click="undo()" />
      <UiIconButton :disabled="!canRedo" label="Redo" :meaning="UiIconMeaning.Redo" @click="redo()" />
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
      <UiToggleGroup v-model="mode" ml-auto label="Design or preview" :items="modeItems" />
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
