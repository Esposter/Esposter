<script setup lang="ts">
import { useSurveyCreatorStore } from "@/store/survey/creator";

// The survey drawn as a respondent would see it, with no answers and nothing to type into. Each page is a heading over its
// Elements, a page and every element is chosen by a click or Enter, and the chosen one takes an accent line inside its edge
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
const { getSelectionBindings } = useSurveyCanvasSelection();
const getPagePointer = (pageIndex: number) => `/content/${pageIndex}`;
</script>

<template>
  <div p-3 flex flex-1 flex-col gap-6 min-h-0 of-y-auto ui-body>
    <section
      v-for="(page, pageIndex) of surveyDocument.content"
      :key="page.props.id"
      :="getSelectionBindings(getPagePointer(pageIndex))"
      ui-ring-outside
      rd="[--ui-container-radius]"
      flex
      flex-col
      gap-3
      tabindex="0"
    >
      <h2 ui-title>{{ page.props.title || `Page ${pageIndex + 1}` }}</h2>
      <ResourceSurveyCreatorCanvasNode
        v-for="(child, childIndex) of page.props.children"
        :key="child.props.id"
        :node="child"
        :pointer="`${getPagePointer(pageIndex)}/props/children/${childIndex}`"
      />
    </section>
  </div>
</template>
