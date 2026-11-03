<script setup lang="ts">
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { getBlockNode } from "headless-block-editor";
import { surveyImageChoiceSchema, surveyNodeChildren, SurveyNodeType } from "survey-engine";

interface Props {
  pointer: string;
}

const { pointer } = defineProps<Props>();
const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument } = storeToRefs(surveyCreatorStore);
const { updateNodeProps } = useSurveyCreatorCommands();
const { uploadPicked } = useSurveyFiles();
// The choices of the picker at the pointer, or none when the node there is not an image picker
const choices = computed(() => {
  const node = getBlockNode(surveyDocument.value, pointer, surveyNodeChildren);
  return node?.type === SurveyNodeType.ImagePicker ? node.props.choices : [];
});
// The choices are written whole, so the list the document keeps is the order the editor shows. The list editor holds
// The rows as a draft, and writes a list only once every row is valid, so a value the list refuses stays as typed
const { addItems, announcement, errors, moveItem, onRowKeydown, removeItem, rows, updateItem } = useSurveyListEditor(
  computed({ get: () => choices.value, set: (nextChoices) => updateNodeProps(pointer, { choices: nextChoices }) }),
  {
    duplicateMessage: "Choice values must be unique",
    getItemError: (choice) =>
      String(choice.value) === ""
        ? "A choice needs a value"
        : surveyImageChoiceSchema.safeParse(choice).error?.issues[0]?.message,
    getKey: (choice) => String(choice.value),
  },
);
// A picked image adds a choice, since a choice cannot be saved without its picture. Its value is a fresh id, which
// Keeps it unique among the choices, since a respondent's answer holds the value
const addChoice = (files: File[]) =>
  uploadPicked(files, (imageLink) => addItems([{ imageLink, text: "", value: crypto.randomUUID() }]));
const replaceImage = (id: string, files: File[]) => uploadPicked(files, (imageLink) => updateItem(id, { imageLink }));
</script>

<template>
  <div flex flex-col gap-4>
    <div aria-live="polite" sr-only>{{ announcement }}</div>
    <div
      v-for="(row, index) of rows"
      :key="row.id"
      :aria-label="`Choice ${index + 1}`"
      role="group"
      flex
      flex-col
      gap-2
      @keydown="(event) => onRowKeydown(event, row.id)"
    >
      <UiTextField
        :error="errors[index]"
        :label="`Value of choice ${index + 1}`"
        :model-value="String(row.item.value)"
        @update:model-value="(value) => updateItem(row.id, { value })"
      />
      <UiTextField
        :label="`Text of choice ${index + 1}`"
        :model-value="row.item.text"
        @update:model-value="(text) => updateItem(row.id, { text })"
      />
      <UiFileField
        accept="image/*"
        :label="`Replace image of choice ${index + 1}`"
        :model-value="[]"
        @update:model-value="(files) => replaceImage(row.id, files)"
      />
      <div flex gap-1>
        <ResourceSurveyCreatorRowActions
          noun="choice"
          :index
          :count="rows.length"
          @move="(toIndex) => moveItem(row.id, toIndex)"
          @remove="removeItem(row.id)"
        />
      </div>
    </div>
    <UiFileField
      accept="image/*"
      label="Add a choice from an image"
      :model-value="[]"
      @update:model-value="(files) => addChoice(files)"
    />
  </div>
</template>
