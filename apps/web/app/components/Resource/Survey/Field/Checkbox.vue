<script setup lang="ts">
import type { SurveyAnswerValue, SurveyCheckboxNode } from "survey-engine";

interface Props {
  error: string;
  isDisabled: boolean;
  node: SurveyCheckboxNode;
}
// The answer is one list: the values of the choices picked, none's own value on its own, and the typed other text, which
// Is the one entry that is neither a choice's value nor none, so other needs no second key
const NONE_VALUE = "none";
const answer = defineModel<SurveyAnswerValue | undefined>();
const { error, isDisabled, node } = defineProps<Props>();
const label = computed(() => node.props.title || node.props.name);
const choiceValues = computed(() => node.props.choices.map(({ value }) => value));
const chosen = computed<SurveyAnswerValue[]>(() => (Array.isArray(answer.value) ? answer.value : []));
const isOtherEntry = (entry: SurveyAnswerValue): entry is string =>
  typeof entry === "string" && entry !== NONE_VALUE && !choiceValues.value.includes(entry);
const isChosen = (value: number | string) => chosen.value.includes(value);
const isAllChosen = computed(() => choiceValues.value.length > 0 && choiceValues.value.every(isChosen));
const isSomeChosen = computed(() => choiceValues.value.some(isChosen));
const isNoneChosen = computed(() => chosen.value.includes(NONE_VALUE));
const isOtherChosen = computed(() => node.props.hasOther && chosen.value.some(isOtherEntry));
const otherText = computed(() => chosen.value.find(isOtherEntry) ?? "");
// None is exclusive, so picking any other option gives it up, and the other text is kept through every pick
const withoutNone = () => chosen.value.filter((entry) => entry !== NONE_VALUE);
const toggleChoice = (value: number | string, isPicked: boolean) => {
  const rest = withoutNone().filter((entry) => entry !== value);
  answer.value = isPicked ? [...rest, value] : rest;
};
const toggleAll = (isPicked: boolean) => {
  const others = chosen.value.filter(isOtherEntry);
  answer.value = isPicked ? [...choiceValues.value, ...others] : others;
};
const toggleNone = (isPicked: boolean) => {
  answer.value = isPicked ? [NONE_VALUE] : [];
};
const toggleOther = (isPicked: boolean) => {
  answer.value = isPicked ? [...withoutNone(), ""] : withoutNone().filter((entry) => !isOtherEntry(entry));
};
const setOtherText = (text: string) => {
  answer.value = chosen.value.map((entry) => (isOtherEntry(entry) ? text : entry));
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
      <div :aria-describedby="describedBy" :aria-label="label" role="group" flex flex-col gap-2>
        <UiCheckbox
          v-if="node.props.hasSelectAll && choiceValues.length > 0"
          is-label-shown
          :aria-invalid="error ? true : undefined"
          :disabled="isDisabled"
          :is-mixed="isSomeChosen && !isAllChosen ? true : undefined"
          :label="node.props.selectAllText || 'Select all'"
          :model-value="isAllChosen"
          @update:model-value="toggleAll"
        />
        <UiCheckbox
          v-for="{ text, value } of node.props.choices"
          :key="value"
          is-label-shown
          :aria-invalid="error ? true : undefined"
          :disabled="isDisabled"
          :label="text || String(value)"
          :model-value="isChosen(value)"
          @update:model-value="(isPicked: boolean) => toggleChoice(value, isPicked)"
        />
        <UiCheckbox
          v-if="node.props.hasNone"
          is-label-shown
          :aria-invalid="error ? true : undefined"
          :disabled="isDisabled"
          :label="node.props.noneText || 'None'"
          :model-value="isNoneChosen"
          @update:model-value="toggleNone"
        />
        <template v-if="node.props.hasOther">
          <UiCheckbox
            is-label-shown
            :aria-invalid="error ? true : undefined"
            :disabled="isDisabled"
            :label="node.props.otherText || 'Other'"
            :model-value="isOtherChosen"
            @update:model-value="toggleOther"
          />
          <UiTextField
            v-if="isOtherChosen"
            :is-disabled="isDisabled ? true : undefined"
            is-label-hidden
            :label="node.props.otherText || 'Other'"
            :model-value="otherText"
            @update:model-value="setOtherText"
          />
        </template>
      </div>
    </template>
  </ResourceSurveyFieldShell>
</template>
