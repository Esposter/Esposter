<script setup lang="ts">
import type { UiCommand } from "@/models/ui/UiCommand";
import type { Context } from "vue-editor-layout-headless";

import { EditorType } from "@/models/editor/EditorType";
import { SurveyEditorSelectionKind } from "@/models/resource/survey/SurveyEditorSelectionKind";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import {
  SURVEY_CREATOR_COMMAND_GROUP,
  SURVEY_DESIGN_MODE,
  SURVEY_PREVIEW_MODE,
} from "@/services/resource/survey/constants";
import { SurveyEditorLayout } from "@/services/resource/survey/SurveyEditorLayout";
import { SurveyEditorPanelNameMap } from "@/services/resource/survey/SurveyEditorPanelNameMap";
import { SurveyEditorRegionNameMap } from "@/services/resource/survey/SurveyEditorRegionNameMap";
import { SurveyEditorRegistry } from "@/services/resource/survey/SurveyEditorRegistry";
import { getHistoryCommands } from "@/services/ui/getHistoryCommands";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { noop } from "@esposter/shared";

const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument, isPreview, selectedNode, selectedPointer } = storeToRefs(surveyCreatorStore);
const { moveNodeDown, moveNodeIntoPrevious, moveNodeOut, moveNodeUp, redo, undo } = useSurveyCreatorCommands();
// What the layout is resolved for: the mode, and what is selected, which is one node or nothing. The survey has no tool in hand
const context = computed<Context>(() => ({
  mode: isPreview.value ? SURVEY_PREVIEW_MODE : SURVEY_DESIGN_MODE,
  selectionCount: selectedNode.value ? 1 : 0,
  selectionKind: selectedNode.value ? SurveyEditorSelectionKind.Node : "",
  tool: "",
}));
// A move acts on the selected element, and does nothing while nothing is selected
const moveSelected = (move: (pointer: string) => unknown) => () => {
  if (selectedPointer.value) move(selectedPointer.value);
};
// The keyboard's moves of the selected element and its history, bound while the creator is mounted, whichever region has focus
useCommands([
  ...getHistoryCommands({
    group: SURVEY_CREATOR_COMMAND_GROUP,
    idPrefix: "survey-creator",
    redo: () => {
      redo();
    },
    redoTitle: "Redo",
    undo: () => {
      undo();
    },
    undoTitle: "Undo",
  }),
  {
    group: SURVEY_CREATOR_COMMAND_GROUP,
    id: "survey-creator-move-up",
    meaning: UiIconMeaning.ArrowUp,
    run: moveSelected(moveNodeUp),
    shortcut: "alt+arrowup",
    title: "Move the selected element up",
  },
  {
    group: SURVEY_CREATOR_COMMAND_GROUP,
    id: "survey-creator-move-down",
    meaning: UiIconMeaning.ArrowDown,
    run: moveSelected(moveNodeDown),
    shortcut: "alt+arrowdown",
    title: "Move the selected element down",
  },
  {
    group: SURVEY_CREATOR_COMMAND_GROUP,
    id: "survey-creator-move-into-previous",
    meaning: UiIconMeaning.ArrowRight,
    run: moveSelected(moveNodeIntoPrevious),
    shortcut: "alt+arrowright",
    title: "Move the selected element into the element before it",
  },
  {
    group: SURVEY_CREATOR_COMMAND_GROUP,
    id: "survey-creator-move-out",
    meaning: UiIconMeaning.ArrowLeft,
    run: moveSelected(moveNodeOut),
    shortcut: "alt+arrowleft",
    title: "Move the selected element out of its parent",
  },
] satisfies UiCommand[]);
</script>

<template>
  <EditorShell
    :context
    :editor-type="EditorType.Survey"
    :layout="SurveyEditorLayout"
    :panel-name-map="SurveyEditorPanelNameMap"
    :region-name-map="SurveyEditorRegionNameMap"
    :registry="SurveyEditorRegistry"
  >
    <ResourceSurveyRunner v-if="isPreview" :document="surveyDocument" :on-complete="noop" />
    <ResourceSurveyCreatorCanvas v-else />
  </EditorShell>
</template>
