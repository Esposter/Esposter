<script setup lang="ts">
import type { SurveyAnswerValue, SurveyRatingNode } from "vue-survey-engine-headless";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { SURVEY_SMILEY_MEANINGS } from "@/services/resource/survey/constants";
import { getSurveyRatingItems } from "@/services/resource/survey/getSurveyRatingItems";
import { getSurveyRatingStep } from "@/services/resource/survey/getSurveyRatingStep";
import { takeOne } from "@esposter/shared";
import { SurveyRatingType } from "vue-survey-engine-headless";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyRatingNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const items = computed(() => getSurveyRatingItems(node.props.rateCount));
const rating = computed<number | string>({
  get: () => getSurveyRatingStep(answer.value),
  set: (value) => {
    answer.value = value;
  },
});
// The steps spread across the faces in order, so the first step draws the angriest face and the last the happiest
const getSmiley = (value: number) =>
  takeOne(
    SURVEY_SMILEY_MEANINGS,
    Math.round(((value - 1) / (node.props.rateCount - 1)) * (SURVEY_SMILEY_MEANINGS.length - 1)),
  );
</script>

<template>
  <ResourceSurveyFieldShell :error :question="node.props">
    <template #default="{ describedBy, title }">
      <UiToggleGroup
        v-if="node.props.rateType === SurveyRatingType.Labels"
        v-model="rating"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-required="node.props.isRequired ? true : undefined"
        :is-disabled="isDisabled || undefined"
        :items
        :label="title"
      />
      <UiRating
        v-else
        v-model="rating"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-required="node.props.isRequired ? true : undefined"
        :count="node.props.rateCount"
        :is-disabled="isDisabled || undefined"
        :label="title"
      >
        <template #mark="{ isOn, value }">
          <UiIcon
            v-if="node.props.rateType === SurveyRatingType.Stars"
            :class="{ 'text-accent': isOn }"
            :meaning="isOn ? UiIconMeaning.StarFilled : UiIconMeaning.Star"
          />
          <UiIcon v-else :class="{ 'text-accent': value === rating }" :meaning="getSmiley(value)" />
        </template>
      </UiRating>
      <div
        v-if="node.props.minRateDescription || node.props.maxRateDescription"
        text-sm
        text-muted
        flex
        gap-2
        justify-between
      >
        <span>{{ node.props.minRateDescription }}</span>
        <span>{{ node.props.maxRateDescription }}</span>
      </div>
    </template>
  </ResourceSurveyFieldShell>
</template>
