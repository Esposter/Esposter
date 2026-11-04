<script setup lang="ts">
import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyPanelDynamicNode,
  SurveyPanelRowView,
  SurveyQuestionNode,
} from "headless-survey-engine";

import { SURVEY_SEEDED_NODE_TYPES } from "@/services/resource/survey/constants";
import { SurveyFieldComponentMap } from "@/services/resource/survey/SurveyFieldComponentMap";
import { SurveyNodeType } from "headless-survey-engine";

interface Props {
  error: string;
  // The runner's view of a dynamic panel's template questions for one row, given to a dynamic panel only. Absent where no runner decides a row
  getRowViews?: (node: SurveyPanelDynamicNode, row: SurveyAnswers) => SurveyPanelRowView[];
  isDisabled: boolean;
  node: SurveyQuestionNode;
  seed: string;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, getRowViews, isDisabled, node, seed } = defineProps<Props>();
// A kind takes only the props it reads: the seed when it orders its choices, and the row views when it is a dynamic panel
const kindProps = computed(() => {
  if (node.type === SurveyNodeType.PanelDynamic) return { getRowViews, seed };

  return SURVEY_SEEDED_NODE_TYPES.has(node.type) ? { seed } : {};
});
</script>

<template>
  <!-- A field loads on demand, so the question is held in its region until the field arrives -->
  <Suspense>
    <component :is="SurveyFieldComponentMap[node.type]" v-model="answer" :="kindProps" :error :is-disabled :node />
    <template #fallback>
      <UiSkeleton h-10 />
    </template>
  </Suspense>
</template>
