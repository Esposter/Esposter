<script setup lang="ts">
import type { UiCommand } from "@/models/ui/UiCommand";
import type { UiTabItem } from "@/models/ui/UiTabItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTabsVariant } from "@/models/ui/UiTabsVariant";
import { DEFAULT_SIDE_PANE_WIDTH } from "@/services/pageBuilder/constants";
import {
  CANVAS_TAB,
  LAYERS_TAB,
  LOGIC_TAB,
  PALETTE_TAB,
  PROPERTIES_TAB,
  STRUCTURE_TAB,
  SURVEY_CREATOR_COMMAND_GROUP,
  THEME_TAB,
} from "@/services/resource/survey/constants";
import { MAX_SIDE_PANE_WIDTH, MIN_SIDE_PANE_WIDTH } from "@/services/ui/constants";
import { getHistoryCommands } from "@/services/ui/getHistoryCommands";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { noop } from "@esposter/shared";

// The tabs a narrow screen stacks the three panes into, one pane at a time: the structure pane's two tabs as one tab
const narrowTabItems: UiTabItem<string>[] = [
  { title: CANVAS_TAB, value: CANVAS_TAB },
  { title: STRUCTURE_TAB, value: STRUCTURE_TAB },
  { title: PROPERTIES_TAB, value: PROPERTIES_TAB },
  { title: LOGIC_TAB, value: LOGIC_TAB },
  { title: THEME_TAB, value: THEME_TAB },
];
const leftTabItems: UiTabItem<string>[] = [
  { title: LAYERS_TAB, value: LAYERS_TAB },
  { title: PALETTE_TAB, value: PALETTE_TAB },
];
const rightTabItems: UiTabItem<string>[] = [
  { title: PROPERTIES_TAB, value: PROPERTIES_TAB },
  { title: LOGIC_TAB, value: LOGIC_TAB },
  { title: THEME_TAB, value: THEME_TAB },
];
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument, isPreview, selectedPointer } = storeToRefs(surveyCreatorStore);
const { moveNodeDown, moveNodeIntoPrevious, moveNodeOut, moveNodeUp, redo, undo } = useSurveyCreatorCommands();
// A move acts on the selected element, and does nothing while nothing is selected
const moveSelected = (move: (pointer: string) => unknown) => () => {
  if (selectedPointer.value) move(selectedPointer.value);
};
// The keyboard's moves of the selected element and its history, bound while the creator is mounted, whichever pane has focus
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
const { smAndDown } = useUiDisplay();
const leftWidth = ref(DEFAULT_SIDE_PANE_WIDTH);
const rightWidth = ref(DEFAULT_SIDE_PANE_WIDTH);
const narrowTab = ref(CANVAS_TAB);
const leftTab = ref(LAYERS_TAB);
const rightTab = ref(PROPERTIES_TAB);
</script>

<template>
  <!-- A narrow screen shows one pane at a time as a tab, and a wider one lays the three side by side with the same panes -->
  <div v-if="smAndDown" flex flex-col h-full min-h-0>
    <UiTabs v-model="narrowTab" :items="narrowTabItems" label="Survey creator" is-filling>
      <template #default="{ value }">
        <div v-if="value === CANVAS_TAB" flex flex-col gap-2 h-full min-h-0>
          <ResourceSurveyCreatorToolbar />
          <ResourceSurveyRunner v-if="isPreview" :document="surveyDocument" :on-complete="noop" />
          <ResourceSurveyCreatorCanvas v-else />
        </div>
        <div v-else-if="value === STRUCTURE_TAB" flex flex-col gap-4>
          <ResourceSurveyCreatorPalette />
          <ResourceSurveyCreatorLayers />
        </div>
        <ResourceSurveyCreatorProperties v-else-if="value === PROPERTIES_TAB" />
        <ResourceSurveyCreatorLogicPane v-else-if="value === LOGIC_TAB" />
        <ResourceSurveyCreatorTheme v-else />
      </template>
    </UiTabs>
  </div>
  <div v-else flex gap-2 h-full min-h-0>
    <div :style="{ width: `${leftWidth}px` }" flex shrink-0 flex-col min-h-0 relative>
      <UiTabs v-model="leftTab" :items="leftTabItems" label="Structure" is-filling h-full>
        <template #default="{ value }">
          <ResourceSurveyCreatorLayers v-if="value === LAYERS_TAB" />
          <ResourceSurveyCreatorPalette v-else />
        </template>
      </UiTabs>
      <UiResizeHandle
        v-model="leftWidth"
        label="Resize the structure pane"
        :max="MAX_SIDE_PANE_WIDTH"
        :min="MIN_SIDE_PANE_WIDTH"
      />
    </div>
    <div flex flex-1 flex-col gap-2 min-h-0 min-w-0>
      <ResourceSurveyCreatorToolbar />
      <ResourceSurveyRunner v-if="isPreview" :document="surveyDocument" :on-complete="noop" />
      <ResourceSurveyCreatorCanvas v-else />
    </div>
    <div :style="{ width: `${rightWidth}px` }" shrink-0 min-h-0 relative>
      <UiResizeHandle
        v-model="rightWidth"
        is-reversed
        label="Resize the settings pane"
        :max="MAX_SIDE_PANE_WIDTH"
        :min="MIN_SIDE_PANE_WIDTH"
      />
      <UiTabs
        v-model="rightTab"
        :items="rightTabItems"
        label="Survey settings"
        is-filling
        :variant="UiTabsVariant.Header"
        px-3
        h-full
      >
        <template #default="{ value }">
          <ResourceSurveyCreatorProperties v-if="value === PROPERTIES_TAB" />
          <ResourceSurveyCreatorLogicPane v-else-if="value === LOGIC_TAB" />
          <ResourceSurveyCreatorTheme v-else />
        </template>
      </UiTabs>
    </div>
  </div>
</template>
