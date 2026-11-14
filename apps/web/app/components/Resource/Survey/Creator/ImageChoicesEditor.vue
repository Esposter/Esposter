<script setup lang="ts">
import { getSurveyChoiceListEditorOptions } from "@/services/resource/survey/getSurveyChoiceListEditorOptions";
import { useAlertStore } from "@/store/alert";
import { v7 } from "uuid";
import { surveyImageChoiceSchema, SurveyNodeType } from "vue-survey-engine-headless";

interface Props {
  pointer: string;
}

const { pointer } = defineProps<Props>();
const { node, updateNodeProps, uploadPicked } = useSurveyPointerNode(() => pointer);
const alertStore = useAlertStore();
const { createAlert } = alertStore;
// The choices of the picker at the pointer, or none when the node there is not an image picker
const choices = computed(() => {
  const picker = node.value;
  return picker?.type === SurveyNodeType.ImagePicker ? picker.props.choices : [];
});
// The choices are written whole, so the list the document keeps is the order the editor shows. The list editor holds
// The rows as a draft, and writes a list only once every row is valid, so a value the list refuses stays as typed
const editor = useSurveyListEditor(
  computed({ get: () => choices.value, set: (nextChoices) => updateNodeProps({ choices: nextChoices }) }),
  getSurveyChoiceListEditorOptions(surveyImageChoiceSchema),
);
const { addItems, updateItem } = editor;
// A picked image adds a choice, since a choice cannot be saved without its picture. Its value is a fresh id, which
// Keeps it unique among the choices, since a respondent's answer holds the value
const addChoice = (files: File[]) =>
  uploadPicked(files, (imageLink) => addItems([{ imageLink, text: "", value: v7() }]));
// A picture lands on the row it was picked for. An edit that removed that row while the upload ran leaves nothing to
// Write it to, so the picture is reported rather than dropped
const replaceImage = (id: string, files: File[]) =>
  uploadPicked(files, (imageLink) => {
    if (!updateItem(id, { imageLink })) createAlert("The image could not be applied.", "error");
  });
</script>

<template>
  <ResourceSurveyCreatorListEditor :editor label="Choices" noun="choice">
    <template #default="{ error, index, row }">
      <UiTextField
        :error
        :label="`Value of choice ${index + 1}`"
        :model-value="String(row.item.value)"
        @update:model-value="(value) => updateItem(row.id, { value })"
      />
      <UiTextField
        :label="`Text of choice ${index + 1}`"
        :model-value="row.item.text"
        @update:model-value="(text) => updateItem(row.id, { text })"
      />
    </template>
    <template #below="{ index, row }">
      <UiFileField
        accept="image/*"
        :label="`Replace image of choice ${index + 1}`"
        :model-value="[]"
        @update:model-value="(files) => replaceImage(row.id, files)"
      />
    </template>
    <template #add>
      <UiFileField
        accept="image/*"
        label="Add a choice from an image"
        :model-value="[]"
        @update:model-value="(files) => addChoice(files)"
      />
    </template>
  </ResourceSurveyCreatorListEditor>
</template>
