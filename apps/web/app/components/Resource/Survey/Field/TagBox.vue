<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyAnswerValue, SurveyTagBoxNode } from "survey-engine";

import { getSurveyChoiceText, getSurveyOrderedChoices } from "survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyTagBoxNode;
}
// A list of choices picked from a multi-select, whose options are keyed by this field's own id: the select writes each
// Option's key as its element's id, and a choice's value may repeat on another field of the same page
const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const id = useId();
const label = computed(() => node.props.title || node.props.name);
const seed = useSurveyChoiceSeed();
// The options in the order the reader sees them, so a key is a choice's place in what the select lists
const orderedChoices = computed(() => getSurveyOrderedChoices(node.props.choices, node.props.choicesOrder, seed));
const choiceKey = (index: number) => `${id}-${index}`;
const otherKey = `${id}-other`;
const choiceValues = computed(() => node.props.choices.map(({ value }) => value));
// A string that is no choice's value is the typed other text, which the answer holds as itself
const isOtherEntry = (entry: SurveyAnswerValue): entry is string =>
  typeof entry === "string" && !choiceValues.value.includes(entry);
// The picks, whether other is picked and its text are held here as the reader makes them. The answer holds other text as
// Itself, so a text equal to a choice's value cannot be read back from it: it would pick that choice and drop the field
const initial = Array.isArray(answer.value) ? answer.value : [];
const pickedValues = ref(choiceValues.value.filter((value) => initial.includes(value)));
const isOtherChosen = ref(node.props.hasOther && initial.some((entry) => isOtherEntry(entry)));
const otherText = ref(initial.find((entry): entry is string => isOtherEntry(entry)) ?? "");
const items = computed<UiMenuItem<string>[]>(() => {
  const choices = orderedChoices.value.map((choice, index) => ({
    title: getSurveyChoiceText(choice),
    value: choiceKey(index),
  }));
  return node.props.hasOther ? [...choices, { title: node.props.otherText || "Other", value: otherKey }] : choices;
});
const selectedKeys = computed(() => {
  const keys = orderedChoices.value.flatMap(({ value }, index) =>
    pickedValues.value.includes(value) ? [choiceKey(index)] : [],
  );
  return isOtherChosen.value ? [...keys, otherKey] : keys;
});
const emitAnswer = () => {
  answer.value = isOtherChosen.value ? [...pickedValues.value, otherText.value] : [...pickedValues.value];
};
// The other text stays as it was while a choice is picked or dropped, and is empty the first time other is picked
const choose = (keys: string[]) => {
  const isPickingOther = keys.includes(otherKey);
  if (isPickingOther && !isOtherChosen.value) otherText.value = "";
  isOtherChosen.value = isPickingOther;
  pickedValues.value = orderedChoices.value.flatMap(({ value }, index) =>
    keys.includes(choiceKey(index)) ? [value] : [],
  );
  emitAnswer();
};
const setOtherText = (text: string) => {
  otherText.value = text;
  emitAnswer();
};
</script>

<template>
  <ResourceSurveyFieldShell
    :description="node.props.description"
    :error
    :is-required="node.props.isRequired"
    :title="label"
  >
    <UiSelect :is-disabled="isDisabled" :items :label :model-value="selectedKeys" @update:model-value="choose" />
    <UiTextField
      v-if="isOtherChosen"
      :is-disabled="isDisabled ? true : undefined"
      is-label-hidden
      :label="node.props.otherText || 'Other'"
      :model-value="otherText"
      @update:model-value="setOtherText"
    />
  </ResourceSurveyFieldShell>
</template>
