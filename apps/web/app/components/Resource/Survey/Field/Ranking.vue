<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { SurveyAnswerValue, SurveyChoice, SurveyRankingNode } from "survey-engine";

import { getSurveyChoiceText } from "survey-engine";

interface Props {
  // The message the runner gives the question when it fails a check, "" when it has none
  error: string;
  isDisabled: boolean;
  node: SurveyRankingNode;
}
interface KeyedChoice {
  choice: SurveyChoice;
  key: string;
}

const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const label = computed(() => node.props.title || node.props.name);
// A choice is keyed by its place in the question, since two values may read alike and a list keys its rows by text
const keyedChoices = computed<KeyedChoice[]>(() =>
  node.props.choices.map((choice, index) => ({ choice, key: String(index) })),
);
// The answer's order, with any choice it leaves out kept after it, so the list never loses a choice
const rankedChoices = computed<KeyedChoice[]>(() => {
  const ranked: KeyedChoice[] = Array.isArray(answer.value)
    ? answer.value.flatMap((value) => keyedChoices.value.filter(({ choice }) => choice.value === value))
    : [];
  return [...ranked, ...keyedChoices.value.filter((keyed) => !ranked.includes(keyed))];
});
const items = computed<UiListItem<string>[]>(() =>
  rankedChoices.value.map(({ choice, key }) => ({ hasMarkSlot: true, title: getSurveyChoiceText(choice), value: key })),
);
// The list hands back its keys in their new order, each read back to the value its choice holds
const onReorder = (keys: string[]) => {
  answer.value = keys.flatMap((key) =>
    keyedChoices.value.filter((keyed) => keyed.key === key).map(({ choice }) => choice.value),
  );
};
</script>

<template>
  <ResourceSurveyFieldShell
    :description="node.props.description"
    :error
    :is-required="node.props.isRequired"
    :title="label"
  >
    <template #default="{ describedBy }">
      <!-- The rows are the choices in their order, each marked with its place; Alt and an arrow moves the focused one -->
      <UiList
        :aria-describedby="describedBy"
        :aria-invalid="error ? true : undefined"
        :is-reorderable="isDisabled ? undefined : true"
        :items
        :label
        @reorder="onReorder"
      >
        <template #mark="{ item }">{{ items.indexOf(item) + 1 }}</template>
      </UiList>
    </template>
  </ResourceSurveyFieldShell>
</template>
