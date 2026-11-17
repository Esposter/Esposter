<script setup lang="ts">
import type { SurveyChoice } from "vue-survey-engine-headless";

import { useSurveyCreatorCommands } from "#src/composables/survey/useSurveyCreatorCommands";
import { getMovedItems } from "#src/services/shared/getMovedItems";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { getBlockNode } from "vue-block-editor-headless";
import { surveyNodeChildren } from "vue-survey-engine-headless";

interface Props {
  choices: SurveyChoice[];
  // The question whose choices these are, the node the surface writes their edits to
  pointer: string;
}

const { pointer } = defineProps<Props>();
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
const { updateNodeProps } = useSurveyCreatorCommands();
// A row added by Enter opens for typing as it is drawn, so its value is held until the row mounts
const addedValue = ref<SurveyChoice["value"]>();
// Each edit reads the choices the store holds, since a commit can be followed by another write before the props catch up
const readChoices = (): SurveyChoice[] => {
  const node = getBlockNode(surveyDocument.value, pointer, surveyNodeChildren);
  return node && "choices" in node.props ? node.props.choices : [];
};
const writeChoices = (nextChoices: SurveyChoice[]) => updateNodeProps(pointer, { choices: nextChoices });
// An emptied choice is removed on commit, unless it is the last one, which keeps the text it held
const updateText = (index: number, text: string) => {
  const currentChoices = readChoices();
  const choice = currentChoices.at(index);
  if (choice === undefined) return;
  if (text === "") {
    if (currentChoices.length > 1) writeChoices(currentChoices.toSpliced(index, 1));
    return;
  }
  writeChoices(currentChoices.toSpliced(index, 1, { ...choice, text }));
};
// A choice a row leaves with no text is removed as it is emptied. A blur that changes nothing reports no edit, so an added
// Choice left empty would otherwise stay in the document
const onChoiceFocusout = (index: number) => {
  if (readChoices().at(index)?.text === "") updateText(index, "");
};
// The smallest number no choice holds as its value, so a new choice is one an answer can name
const getNextValue = (currentChoices: SurveyChoice[]) => {
  const values = new Set(currentChoices.map(({ value }) => String(value)));
  let value = 1;
  while (values.has(String(value))) value += 1;
  return value;
};
// Enter in the last choice adds an empty one after it, which opens for typing
const submitChoice = (index: number, text: string) => {
  const currentChoices = readChoices();
  if (text === "" || index !== currentChoices.length - 1) return;

  const value = getNextValue(currentChoices);
  addedValue.value = value;
  writeChoices([...currentChoices, { text: "", value }]);
};
// Alt with the up or down arrow moves the choice one place. The key stops at the choice, so the element does not move with it
const onChoiceKeydown = (event: KeyboardEvent, index: number) => {
  if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;

  event.preventDefault();
  event.stopPropagation();
  const moved = getMovedItems(readChoices(), index, index + (event.key === "ArrowUp" ? -1 : 1));
  if (moved) writeChoices(moved);
};
</script>

<template>
  <ol pl-0 list-none flex flex-col gap-1>
    <li
      v-for="(choice, index) of choices"
      :key="String(choice.value)"
      flex
      gap-2
      items-center
      @keydown="(event: KeyboardEvent) => onChoiceKeydown(event, index)"
      @focusout="onChoiceFocusout(index)"
    >
      <span text-muted aria-hidden="true">{{ index + 1 }}.</span>
      <ResourceSurveyCreatorCanvasEditableText
        :model-value="choice.text"
        :label="`Choice ${index + 1}`"
        :is-initially-editing="choice.value === addedValue || undefined"
        @update:model-value="(text) => updateText(index, text)"
        @enter="(text) => submitChoice(index, text)"
      />
    </li>
  </ol>
</template>
