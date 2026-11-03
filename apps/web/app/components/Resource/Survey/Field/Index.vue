<script setup lang="ts">
import type { SurveyAnswerValue, SurveyQuestionNode } from "survey-engine";

import { SurveyFieldComponentMap } from "@/services/resource/survey/SurveyFieldComponentMap";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyQuestionNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
</script>

<template>
  <!-- A field loads on demand, so the question is held in its region until the field arrives -->
  <Suspense>
    <component :is="SurveyFieldComponentMap[node.type]" v-model="answer" :error :is-disabled="isDisabled" :node />
    <template #fallback>
      <UiSkeleton h-10 />
    </template>
  </Suspense>
</template>
