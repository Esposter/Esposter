<script setup lang="ts">
import type { SurveyPlaceableNode } from "headless-survey-engine";

import { SurveyNodeType } from "headless-survey-engine";

interface Props {
  // The question or panel drawn here, which a page or a panel holds
  node: SurveyPlaceableNode;
  // Where the node sits in the document, which is what choosing it selects
  pointer: string;
}

const { node, pointer } = defineProps<Props>();
const { getSelectionBindings } = useSurveyCanvasSelection();
</script>

<template>
  <!-- A question is drawn by its field with the pointer events off, so a click lands on this element and selects it -->
  <div :="getSelectionBindings(pointer)" ui-ring-outside rd="[--ui-container-radius]" tabindex="0">
    <div v-if="node.type === SurveyNodeType.Panel" p-3 b-border rd="[--ui-container-radius]" flex flex-col gap-3>
      <h3 v-if="node.props.title" ui-title>{{ node.props.title }}</h3>
      <ResourceSurveyCreatorCanvasNode
        v-for="(child, index) of node.props.children"
        :key="child.props.id"
        :node="child"
        :pointer="`${pointer}/props/children/${index}`"
      />
    </div>
    <div v-else pointer-events-none>
      <ResourceSurveyField error="" :node seed="" is-disabled />
    </div>
  </div>
</template>
