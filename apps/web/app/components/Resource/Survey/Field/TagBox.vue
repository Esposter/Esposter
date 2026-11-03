<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { SurveyAnswerValue, SurveyTagBoxNode } from "survey-engine";

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
const choiceKey = (index: number) => `${id}-${index}`;
const otherKey = `${id}-other`;
const chosen = computed<SurveyAnswerValue[]>(() => (Array.isArray(answer.value) ? answer.value : []));
const choiceValues = computed(() => node.props.choices.map(({ value }) => value));
// A string that is no choice's value is the typed other text, which the answer holds as itself
const isOtherEntry = (entry: SurveyAnswerValue): entry is string =>
  typeof entry === "string" && !choiceValues.value.includes(entry);
const isOtherChosen = computed(() => node.props.hasOther && chosen.value.some(isOtherEntry));
const otherText = computed(() => chosen.value.find(isOtherEntry) ?? "");
const items = computed<UiMenuItem<string>[]>(() => {
  const choices = node.props.choices.map(({ text, value }, index) => ({
    title: text || String(value),
    value: choiceKey(index),
  }));
  return node.props.hasOther ? [...choices, { title: node.props.otherText || "Other", value: otherKey }] : choices;
});
const selectedKeys = computed(() => {
  const keys = node.props.choices.flatMap(({ value }, index) =>
    chosen.value.includes(value) ? [choiceKey(index)] : [],
  );
  return isOtherChosen.value ? [...keys, otherKey] : keys;
});
// The other text stays as it was while a choice is picked or dropped, and is empty the first time other is picked
const choose = (keys: string[]) => {
  const picked = node.props.choices.flatMap(({ value }, index) => (keys.includes(choiceKey(index)) ? [value] : []));
  answer.value = keys.includes(otherKey) ? [...picked, otherText.value] : picked;
};
const setOtherText = (text: string) => {
  answer.value = chosen.value.map((entry) => (isOtherEntry(entry) ? text : entry));
};
</script>

<template>
  <div flex flex-col gap-1>
    <span text-sm text-muted>
      {{ label }}
      <span v-if="node.props.isRequired" aria-hidden="true" text-error>*</span>
    </span>
    <span v-if="node.props.description" text-sm text-muted>{{ node.props.description }}</span>
    <UiSelect :is-disabled="isDisabled" :items :label :model-value="selectedKeys" @update:model-value="choose" />
    <UiTextField
      v-if="isOtherChosen"
      :is-disabled="isDisabled ? true : undefined"
      is-label-hidden
      :label="node.props.otherText || 'Other'"
      :model-value="otherText"
      @update:model-value="setOtherText"
    />
    <span v-if="error" role="alert" text-sm text-error>{{ error }}</span>
  </div>
</template>
