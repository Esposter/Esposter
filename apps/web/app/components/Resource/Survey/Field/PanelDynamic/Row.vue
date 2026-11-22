<script setup lang="ts">
import type { SurveyAnswers, SurveyQuestionNode } from "vue-survey-engine-headless";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { withSurveyAnswer } from "#src/services/resource/survey/withSurveyAnswer";

interface Props {
  fields: { isDisabled: boolean; node: SurveyQuestionNode }[];
  isRemoveDisabled: boolean;
  panel: SurveyAnswers;
  removeLabel: string;
  seed: string;
}

defineProps<Props>();
const emit = defineEmits<{ remove: []; update: [panel: SurveyAnswers] }>();
</script>

<template>
  <div p-4 flex flex-col gap-4 ui-frame>
    <ResourceSurveyField
      v-for="field of fields"
      :key="field.node.props.id"
      error=""
      :is-disabled="field.isDisabled"
      :model-value="panel[field.node.props.name]"
      :node="field.node"
      :seed
      @update:model-value="(value) => emit('update', withSurveyAnswer(panel, field.node.props.name, value))"
    />
    <UiIconButton
      :disabled="isRemoveDisabled"
      :label="removeLabel"
      :meaning="UiIconMeaning.Remove"
      :variant="UiButtonVariant.Quiet"
      type="button"
      self-end
      @click="emit('remove')"
    />
  </div>
</template>
