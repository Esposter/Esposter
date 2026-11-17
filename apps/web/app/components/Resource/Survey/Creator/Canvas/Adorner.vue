<script setup lang="ts">
import type { Item } from "#src/models/shared/Item";
import type { SurveyNodeType, SurveyPlaceableNode } from "vue-survey-engine-headless";

import { useSurveyCreatorCommands } from "#src/composables/survey/useSurveyCreatorCommands";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getSurveyKindChangeTypes } from "#src/services/resource/survey/getSurveyKindChangeTypes";
import { getSurveyKindItems } from "#src/services/resource/survey/getSurveyKindItems";
import {
  checkIsSurveyAnsweringNode,
  convertSurveyNodeKind,
  SurveyNodeType as SurveyNodeTypeValue,
  SurveyRatingType,
} from "vue-survey-engine-headless";

interface Props {
  // The selected element the bar acts on
  node: SurveyPlaceableNode;
  // Where the element sits in the document, which the commands take
  pointer: string;
}

const { node, pointer } = defineProps<Props>();
const { convertNodeKind, duplicateNode, removeNode, updateNodeProps } = useSurveyCreatorCommands();
const isDeleteOpen = ref(false);
const isKindChangeOpen = ref(false);
// The kind a change that drops content is waiting on the owner to confirm
const pendingKind = ref<SurveyNodeType>();
// A kind change that drops nothing applies at once, and one that drops content asks first
const chooseKind = (type: SurveyNodeType) => {
  const change = convertSurveyNodeKind(node, type);
  if (change === undefined) return;

  if (change.isContentDropped) {
    pendingKind.value = type;
    isKindChangeOpen.value = true;
  } else convertNodeKind(pointer, type);
};
const kindItems = computed<Item[]>(() => getSurveyKindItems(getSurveyKindChangeTypes(node), chooseKind));
const rateTypeItems = computed<Item[]>(() =>
  Object.values(SurveyRatingType).map((rateType) => ({
    meaning: UiIconMeaning.Star,
    onClick: () => {
      updateNodeProps(pointer, { rateType });
    },
    title: `Rate ${rateType}`,
  })),
);
const confirmKindChange = () => {
  if (pendingKind.value !== undefined) convertNodeKind(pointer, pendingKind.value);
};
</script>

<template>
  <div
    role="toolbar"
    aria-label="Element actions"
    mb-1
    p-1
    b-border
    bg-background
    flex
    gap-1
    items-center
    bottom-full
    right-0
    absolute
    rd="[--ui-container-radius]"
  >
    <template v-if="checkIsSurveyAnsweringNode(node)">
      <UiButton
        :aria-pressed="node.props.isRequired"
        @click="updateNodeProps(pointer, { isRequired: !node.props.isRequired })"
      >
        Required
      </UiButton>
      <UiOverflowMenu :items="kindItems" label="Change kind" />
    </template>
    <UiOverflowMenu v-if="node.type === SurveyNodeTypeValue.Rating" :items="rateTypeItems" label="Rate type" />
    <UiIconButton label="Duplicate" :meaning="UiIconMeaning.Copy" @click="duplicateNode(pointer)" />
    <UiIconButton label="Delete" :meaning="UiIconMeaning.Delete" @click="isDeleteOpen = true" />
    <UiConfirmDialog
      v-model="isDeleteOpen"
      confirm-label="Delete"
      :confirm="() => removeNode(pointer)"
      title="Delete element"
    >
      The element and everything in it will be removed.
    </UiConfirmDialog>
    <UiConfirmDialog
      v-model="isKindChangeOpen"
      confirm-label="Change kind"
      :confirm="confirmKindChange"
      title="Change kind"
    >
      The new kind does not hold some of this question's settings, and they will be dropped.
    </UiConfirmDialog>
  </div>
</template>
