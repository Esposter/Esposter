<script setup lang="ts">
import type { SurveyRootProps } from "survey-engine";

import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { SurveyNodeExtrasComponentMap } from "@/services/resource/survey/SurveyNodeExtrasComponentMap";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import { checkIsDeepEqual } from "@esposter/shared";
import { getBlockTypeDefinition } from "headless-block-editor";
import { surveyRegistry, surveyRootPropsSchema } from "survey-engine";

const surveyCreatorStore = useSurveyCreatorStore();
const { document: surveyDocument, selectedNode, selectedPointer } = storeToRefs(surveyCreatorStore);
const { updateNodeProps, updateRootProps } = useSurveyCreatorCommands();
const nodeDefinition = computed(
  () => selectedNode.value && getBlockTypeDefinition(surveyRegistry, selectedNode.value.type),
);
const extraEditors = computed(
  () => (selectedNode.value && SurveyNodeExtrasComponentMap[selectedNode.value.type]) ?? [],
);
// The props a node's form holds: a copy, so the form never writes into the document it is drawn from
const nodeProps = computed<Record<string, unknown>>(() => ({ ...selectedNode.value?.props }));
// The form draws every prop its schema holds except the lists the extra editors draw, so each list is drawn once
const nodeFormSchema = computed(() => {
  const omitted: Record<string, true> = {};
  for (const { key } of extraEditors.value) {
    omitted[key] = true;
  }

  return nodeDefinition.value?.formSchema.omit(omitted);
});
const nodeJsonSchema = computed(() => nodeFormSchema.value && zodToJsonSchema(nodeFormSchema.value));
// The root's form draws the survey's texts: the calculated values are the Logic tab's, and the theme's keys the Theme tab's
const rootJsonSchema = zodToJsonSchema(
  surveyRootPropsSchema.omit({
    accentColor: true,
    backgroundColor: true,
    calculatedValues: true,
    logo: true,
    showProgressBar: true,
    showQuestionNumbers: true,
  }),
);
// The props an edit changed, the only ones written, so the rest of the props are left as they were
const getChangedProps = <T extends object>(value: T, saved: T): Partial<T> => {
  const changed: Partial<T> = {};
  for (const key in value) {
    if (!checkIsDeepEqual(value[key], saved[key])) changed[key] = value[key];
  }

  return changed;
};
// An edit writes the props it changed as one edit, and nothing while the value it leaves is refused by the schema: the
// Form keeps showing that value until it is valid
const setNodeProps = (props: Record<string, unknown>) => {
  const changed = getChangedProps(props, nodeProps.value);
  if (Object.keys(changed).length === 0) return;
  if (!nodeDefinition.value?.formSchema.safeParse(props).success) return;

  updateNodeProps(selectedPointer.value, changed);
};
const setRootProps = (props: SurveyRootProps) => {
  const changed = getChangedProps(props, surveyDocument.value.root.props);
  if (Object.keys(changed).length === 0) return;
  if (!surveyRootPropsSchema.safeParse(props).success) return;

  updateRootProps(changed);
};
</script>

<template>
  <div flex flex-col gap-4>
    <span text-sm text-muted>{{ selectedNode ? nodeDefinition?.label : "Survey" }}</span>
    <template v-if="selectedNode">
      <UiSchemaForm
        v-if="nodeJsonSchema && nodeDefinition"
        :model-value="nodeProps"
        :schema="nodeJsonSchema"
        :validation-schema="nodeDefinition.formSchema"
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
    </template>
    <UiSchemaForm
      v-else
      :model-value="surveyDocument.root.props"
      :schema="rootJsonSchema"
      :validation-schema="surveyRootPropsSchema"
      @update:model-value="(props) => setRootProps(props)"
    />
  </div>
</template>
