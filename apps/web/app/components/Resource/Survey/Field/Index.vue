<script setup lang="ts">
import type { SurveyAnswerValue, SurveyQuestionNode } from "survey-engine";

import { SURVEY_SEEDED_NODE_TYPES } from "@/services/resource/survey/constants";
import { SurveyFieldComponentMap } from "@/services/resource/survey/SurveyFieldComponentMap";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyQuestionNode;
  seed: string;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node, seed } = defineProps<Props>();
// Only a kind that orders its choices takes the seed, since a kind with no choice list has no use for it
const seedProps = computed(() => (SURVEY_SEEDED_NODE_TYPES.has(node.type) ? { seed } : {}));
</script>

<template>
  <!-- A field loads on demand, so the question is held in its region until the field arrives -->
  <Suspense>
    <component :is="SurveyFieldComponentMap[node.type]" v-model="answer" :="seedProps" :error :is-disabled :node />
    <template #fallback>
      <UiSkeleton h-10 />
    </template>
  </Suspense>
</template>
