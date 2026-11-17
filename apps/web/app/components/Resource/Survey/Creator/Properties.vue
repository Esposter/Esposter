<script setup lang="ts">
import type { SurveyRootProps } from "vue-survey-engine-headless";

import { SurveyImageExtras, SurveyImageExtrasKeyMap } from "#src/services/resource/survey/SurveyImageExtras";
import { SurveyNodeExtrasComponentMap } from "#src/services/resource/survey/SurveyNodeExtrasComponentMap";
import { useSurveyCreatorStore } from "#src/store/survey/creator";
import { checkIsDeepEqual } from "@esposter/shared";
import { getBlockTypeDefinition } from "vue-block-editor-headless";
import { surveyRegistry, surveyRootPropsSchema } from "vue-survey-engine-headless";

const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument, selectedNode, selectedPointer } = storeToRefs(surveyCreatorStore);
const { updateNodeProps, updateRootProps } = useSurveyCreatorCommands();
const nodeDefinition = computed(
  () => selectedNode.value && getBlockTypeDefinition(surveyRegistry, selectedNode.value.type),
);
const extraEditors = computed(
  () => (selectedNode.value && SurveyNodeExtrasComponentMap[selectedNode.value.type]) ?? [],
);
const imageEditors = computed(() => (selectedNode.value && SurveyImageExtras[selectedNode.value.type]) ?? []);
const imageEditorKeys = computed(() => (selectedNode.value && SurveyImageExtrasKeyMap[selectedNode.value.type]) ?? []);
// The props a node's form holds: a copy, so the form never writes into the document it is drawn from
const nodeProps = computed<Record<string, unknown>>(() => ({ ...selectedNode.value?.props }));
// The form draws every prop its schema holds except the lists the extra editors draw and the props the image editors
// Draw, so each is drawn once. The same schema is what an edit is checked against, so the two cannot disagree
const nodeFormSchema = computed(() => {
  const omitted: Record<string, true> = {};
  for (const { key } of extraEditors.value) omitted[key] = true;
  for (const key of imageEditorKeys.value) omitted[key] = true;

  return nodeDefinition.value?.formSchema.omit(omitted);
});
// The root's form draws the survey's texts: the calculated values are the Logic tab's, and the theme's keys the Theme
// Tab's. It is loose, as a node's props schema is, so a prop the form does not draw is never refused on this form's behalf
const rootFormSchema = surveyRootPropsSchema
  .omit({
    accentColor: true,
    backgroundColor: true,
    backgroundImage: true,
    calculatedValues: true,
    isQuestionNumbersVisible: true,
    logo: true,
    showProgressBar: true,
  })
  .loose();
// The props an edit changed, the only ones written, so the rest of the props are left as they were
const getChangedProps = <T extends object>(value: T, saved: T): Partial<T> => {
  const changed: Partial<T> = {};
  for (const key in value) if (!checkIsDeepEqual(value[key], saved[key])) changed[key] = value[key];

  return changed;
};
// An edit writes the props it changed as one edit, and nothing while the value it leaves is refused by the schema: the
// Form keeps showing that value until it is valid
const setNodeProps = (props: Record<string, unknown>) => {
  const changed = getChangedProps(props, nodeProps.value);
  if (Object.keys(changed).length === 0) return;
  if (!nodeFormSchema.value?.safeParse(props).success) return;

  updateNodeProps(selectedPointer.value, changed);
};
const setRootProps = (props: SurveyRootProps) => {
  const changed = getChangedProps(props, surveyDocument.value.root.props);
  if (Object.keys(changed).length === 0) return;
  if (!rootFormSchema.safeParse(props).success) return;

  updateRootProps(changed);
};
</script>

<template>
  <div flex flex-col gap-2>
    <span text-sm text-muted>{{ selectedNode ? nodeDefinition?.label : "Survey" }}</span>
    <template v-if="selectedNode">
      <UiSchemaForm
        v-if="nodeFormSchema && nodeDefinition"
        :model-value="nodeProps"
        :schema="nodeFormSchema"
        @update:model-value="(props) => setNodeProps(props)"
      />
      <component
        :is="editor.component"
        v-for="editor of extraEditors"
        :key="`${selectedPointer}:${editor.key}`"
        :label="editor.label"
        :model-value="nodeProps[editor.key]"
        @update:model-value="(value) => updateNodeProps(selectedPointer, { [editor.key]: value })"
      />
      <component
        :is="editor"
        v-for="(editor, index) of imageEditors"
        :key="`${selectedPointer}:image:${index}`"
        :pointer="selectedPointer"
      />
    </template>
    <UiSchemaForm
      v-else
      :model-value="surveyDocument.root.props"
      :schema="rootFormSchema"
      @update:model-value="(props) => setRootProps(props)"
    />
  </div>
</template>
