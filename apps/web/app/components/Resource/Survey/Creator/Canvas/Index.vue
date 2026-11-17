<script setup lang="ts">
import { useSurveyCreatorCommands } from "#src/composables/survey/useSurveyCreatorCommands";
import { SURVEY_ANSWERING_PALETTE_TYPES } from "#src/services/resource/survey/constants";
import { getSurveyDropSlots } from "#src/services/resource/survey/getSurveyDropSlots";
import { getSurveyKindItems } from "#src/services/resource/survey/getSurveyKindItems";
import { SurveyNodeTypeIconMap } from "#src/services/resource/survey/SurveyNodeTypeIconMap";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { SurveyNodeType, surveyNodeTypeDefinitionMap } from "vue-survey-engine-headless";

// The survey drawn as a respondent would see it, with no answers and nothing to type into. Each page is a heading over its
// Elements, a page and every element is chosen by a click or Enter, and the chosen one takes an accent line inside its edge
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument, selectedPointer } = storeToRefs(surveyCreatorStore);
const { getSelectionBindings } = useSurveyCanvasSelection();
const { draggedType, dragPoint, registerSlots } = useSurveyCreatorDrag();
const { insertNodeAt, updateNodeProps } = useSurveyCreatorCommands();
const canvas = useTemplateRef("canvas");
// A drag reads the boxes once, as it starts, from the rendered DOM. The canvas registers the measuring while it is mounted
registerSlots(() => getSurveyDropSlots(canvas.value ?? undefined, surveyDocument.value));
const getPagePointer = (pageIndex: number) => `/content/${pageIndex}`;
const getSlotPointer = (pageIndex: number) => `${getPagePointer(pageIndex)}/props/children`;
// The ellipsis beside a page's add control offers the kinds a question can be added as, each inserted at the end of that page
const getKindItems = (pageIndex: number, childrenCount: number) =>
  getSurveyKindItems(SURVEY_ANSWERING_PALETTE_TYPES, (type) => {
    insertNodeAt(type, getSlotPointer(pageIndex), childrenCount);
  });
</script>

<template>
  <div ref="canvas" p-3 flex flex-1 flex-col min-h-0 of-y-auto ui-body>
    <div max-w="[48rem]" mx-a flex flex-col gap-6 w-full>
      <section
        v-for="(page, pageIndex) of surveyDocument.content"
        :key="page.props.id"
        :="getSelectionBindings(getPagePointer(pageIndex))"
        :data-survey-slot="getSlotPointer(pageIndex)"
        ui-ring-outside
        rd="[--ui-container-radius]"
        flex
        flex-col
        gap-3
        tabindex="0"
      >
        <template v-if="selectedPointer === getPagePointer(pageIndex)">
          <ResourceSurveyCreatorCanvasEditableText
            :model-value="page.props.title"
            label="Page title"
            @update:model-value="(title) => updateNodeProps(getPagePointer(pageIndex), { title })"
          />
          <ResourceSurveyCreatorCanvasEditableText
            :model-value="page.props.description"
            label="Page description"
            @update:model-value="(description) => updateNodeProps(getPagePointer(pageIndex), { description })"
          />
        </template>
        <h2 v-else ui-title>{{ page.props.title || `Page ${pageIndex + 1}` }}</h2>
        <ResourceSurveyCreatorCanvasSlot :children="page.props.children" :slot-pointer="getSlotPointer(pageIndex)" />
        <div flex gap-1 items-center>
          <UiButton @click="insertNodeAt(SurveyNodeType.Text, getSlotPointer(pageIndex), page.props.children.length)">
            Add question
          </UiButton>
          <UiOverflowMenu
            :items="getKindItems(pageIndex, page.props.children.length)"
            label="Other kinds of question"
          />
        </div>
      </section>
      <UiButton
        b-dashed
        w-full
        rd="[--ui-container-radius]"
        @click="insertNodeAt(SurveyNodeType.Page, '/content', surveyDocument.content.length)"
      >
        Add page
      </UiButton>
    </div>
    <UiDragGhost
      v-if="draggedType !== undefined"
      :icon="SurveyNodeTypeIconMap[draggedType]"
      :point="dragPoint"
      :title="surveyNodeTypeDefinitionMap[draggedType].label"
    />
  </div>
</template>
