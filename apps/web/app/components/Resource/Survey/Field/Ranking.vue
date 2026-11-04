<script setup lang="ts">
import type { SurveyKeyedChoice } from "@/models/resource/survey/SurveyKeyedChoice";
import type { UiListItem } from "@/models/ui/UiListItem";
import type { SurveyAnswerValue, SurveyChoice, SurveyRankingNode } from "survey-engine";

import { getSurveyKeyedChoices } from "@/services/resource/survey/getSurveyKeyedChoices";
import { getSurveyChoiceText } from "survey-engine";

interface Props {
  // The message the runner gives the question when it fails a check, "" when it has none
  error: string;
  isDisabled: boolean;
  node: SurveyRankingNode;
}

const answer = defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { error, isDisabled, node } = defineProps<Props>();
// The answer's order, with any choice it leaves out kept after it, so the list never loses a choice
const rankedChoices = computed(() => {
  const keyedChoices = getSurveyKeyedChoices(node.props.choices);
  const ranked: SurveyKeyedChoice<SurveyChoice>[] = Array.isArray(answer.value)
    ? answer.value.flatMap((value) => keyedChoices.filter(({ choice }) => choice.value === value))
    : [];
  return [...ranked, ...keyedChoices.filter((keyed) => !ranked.includes(keyed))];
});
const items = computed<UiListItem<string>[]>(() =>
  rankedChoices.value.map(({ choice, key }) => ({ hasMarkSlot: true, title: getSurveyChoiceText(choice), value: key })),
);
// The list hands back its keys in their new order, each read back to the value its choice holds
const onReorder = (keys: string[]) => {
  const keyedChoices = getSurveyKeyedChoices(node.props.choices);
  answer.value = keys.flatMap((key) =>
    keyedChoices.filter((keyed) => keyed.key === key).map(({ choice }) => choice.value),
  );
};
</script>

<template>
  <ResourceSurveyFieldShell :error :question="node.props">
    <template #default="{ describedBy, labelledBy, title }">
      <!-- The rows are the choices in their order, each marked with its place; Alt and an arrow moves the focused one -->
      <UiList
        :aria-describedby="describedBy"
        :aria-labelledby="labelledBy"
        :is-reorderable="isDisabled ? undefined : true"
        :items
        :label="title"
        @reorder="(keys) => onReorder(keys)"
      >
        <template #mark="{ item }">{{ items.indexOf(item) + 1 }}</template>
      </UiList>
    </template>
  </ResourceSurveyFieldShell>
</template>
