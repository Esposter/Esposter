<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { SurveyAnswerValue, SurveyChoice, SurveyRankingNode } from "survey-engine";

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
const id = useId();
const label = computed(() => node.props.title || node.props.name);
const descriptionId = `${id}-description`;
const errorId = `${id}-error`;
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
  rankedChoices.value.map(({ choice, key }) => ({
    hasMarkSlot: true,
    title: choice.text || String(choice.value),
    value: key,
  })),
);
const describedBy = computed(
  () => [node.props.description && descriptionId, error && errorId].filter(Boolean).join(" ") || undefined,
);
// The list hands back its keys in their new order, each read back to the value its choice holds
const onReorder = (keys: string[]) => {
  answer.value = keys.flatMap((key) =>
    keyedChoices.value.filter((keyed) => keyed.key === key).map(({ choice }) => choice.value),
  );
};
</script>

<template>
  <div flex flex-col gap-2>
    <span text-sm text-muted
      >{{ label }}<span v-if="node.props.isRequired" aria-hidden="true" text-error> *</span></span
    >
    <span v-if="node.props.description" :id="descriptionId" text-sm text-muted>{{ node.props.description }}</span>
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
    <span v-if="error" :id="errorId" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
