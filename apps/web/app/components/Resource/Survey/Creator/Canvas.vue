<script setup lang="ts">
import { getSurveyDropSlots } from "@/services/resource/survey/getSurveyDropSlots";
import { SurveyNodeTypeIconMap } from "@/services/resource/survey/SurveyNodeTypeIconMap";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { surveyNodeTypeDefinitionMap } from "vue-survey-engine-headless";

// The survey drawn as a respondent would see it, with no answers and nothing to type into. Each page is a heading over its
// Elements, a page and every element is chosen by a click or Enter, and the chosen one takes an accent line inside its edge
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
const { getSelectionBindings } = useSurveyCanvasSelection();
const { dragPoint, draggedType, registerSlots } = useSurveyCreatorDrag();
const canvas = useTemplateRef("canvas");
// A drag reads the boxes once, as it starts, from the rendered DOM. The canvas registers the measuring while it is mounted
registerSlots(() => getSurveyDropSlots(canvas.value ?? undefined, surveyDocument.value));
const getPagePointer = (pageIndex: number) => `/content/${pageIndex}`;
</script>

<template>
  <div ref="canvas" p-3 flex flex-1 flex-col min-h-0 of-y-auto ui-body>
    <div flex flex-col gap-6 w-full max-w="[48rem]" mx-auto>
      <section
        v-for="(page, pageIndex) of surveyDocument.content"
        :key="page.props.id"
        :="getSelectionBindings(getPagePointer(pageIndex))"
        :data-survey-slot="`${getPagePointer(pageIndex)}/props/children`"
        ui-ring-outside
        rd="[--ui-container-radius]"
        flex
        flex-col
        gap-3
        tabindex="0"
      >
        <h2 ui-title>{{ page.props.title || `Page ${pageIndex + 1}` }}</h2>
        <ResourceSurveyCreatorCanvasSlot
          :children="page.props.children"
          :slot-pointer="`${getPagePointer(pageIndex)}/props/children`"
        />
      </section>
    </div>
    <UiDragGhost
      v-if="draggedType !== undefined"
      :icon="SurveyNodeTypeIconMap[draggedType]"
      :point="dragPoint"
      :title="surveyNodeTypeDefinitionMap[draggedType].label"
    />
  </div>
</template>
