<script setup lang="ts">
import type { SurveyPlaceableNode } from "vue-survey-engine-headless";

import { SurveyNodeType, surveyNodeTypeDefinitionMap } from "vue-survey-engine-headless";

interface Props {
  // The element a drag would insert here, drawn as it would sit once dropped
  node: SurveyPlaceableNode;
}

const { node } = defineProps<Props>();
</script>

<template>
  <!-- Translucent and dashed, and pointer events are off, so the drag's pointer passes through the place it marks -->
  <div aria-hidden="true" b-border border-dashed rd="[--ui-container-radius]" op-60 pointer-events-none>
    <div v-if="node.type === SurveyNodeType.Panel" p-3 text-muted>
      {{ surveyNodeTypeDefinitionMap[node.type].label }}
    </div>
    <ResourceSurveyField v-else error="" :node seed="" is-disabled />
  </div>
</template>
