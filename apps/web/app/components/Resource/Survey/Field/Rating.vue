<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyAnswerValue, SurveyRatingNode } from "survey-engine";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { SURVEY_SMILEY_MEANINGS } from "@/services/resource/survey/constants";
import { takeOne } from "@esposter/shared";
import { SurveyRatingType } from "survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyRatingNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
const label = computed(() => node.props.title || node.props.name);
const items = computed<UiMenuItem<number>[]>(() =>
  Array.from({ length: node.props.rateCount }, (_value, index) => ({ title: String(index + 1), value: index + 1 })),
);
// An answer no step has yet is the empty text, as a choice group's absent value is
const rating = computed<number | string>({
  get: () => (typeof answer.value === "number" ? answer.value : ""),
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
  <ResourceSurveyFieldShell
    :description="node.props.description"
    :error
    :is-required="node.props.isRequired"
    :title="label"
  >
    <template #default="{ describedBy }">
      <UiToggleGroup
        v-if="node.props.rateType === SurveyRatingType.Labels"
        v-model="rating"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-required="node.props.isRequired ? true : undefined"
        :is-disabled
        :items
        :label
      />
      <UiRating
        v-else
        v-model="rating"
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :aria-required="node.props.isRequired ? true : undefined"
        :count="node.props.rateCount"
        :is-disabled
        :label
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
