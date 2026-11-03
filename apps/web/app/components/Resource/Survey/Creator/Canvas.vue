<script setup lang="ts">
// The survey drawn as a respondent would see it, with no answers and nothing to type into. Each page is a heading over its
// Elements, a page and every element is chosen by a click or Enter, and the chosen one is outlined
const { document: surveyDocument, selectedPointer } = storeToRefs(useSurveyCreatorStore());
const { select } = useSurveyCreatorCommands();
const getPagePointer = (pageIndex: number) => `/content/${pageIndex}`;
</script>

<template>
  <div p-3 flex flex-col flex-1 gap-6 min-h-0 of-y-auto ui-body>
    <section
      v-for="(page, pageIndex) of surveyDocument.content"
      :key="page.props.id"
      :class="{ 'outline-accent': selectedPointer === getPagePointer(pageIndex) }"
      flex
      flex-col
      gap-3
      outline-2
      outline-offset-2
      outline-solid
      outline-transparent
      rd-[var(--ui-container-radius)]
      tabindex="0"
      @click.stop="select(getPagePointer(pageIndex))"
      @keydown.enter.self="select(getPagePointer(pageIndex))"
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
