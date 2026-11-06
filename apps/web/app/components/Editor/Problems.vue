<script setup lang="ts">
import type { EditorFinding } from "@/models/editor/EditorFinding";
import type { UiListItem } from "@/models/ui/UiListItem";

import { EditorFindingSeverity } from "@/models/editor/EditorFindingSeverity";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiStatusIconMeaningMap } from "@/services/ui/UiStatusIconMeaningMap";
import { takeOne } from "@esposter/shared";

interface Props {
  // The findings of the editor's check as it last ran over the document, each naming the node it concerns by id
  findings: EditorFinding[];
  // The title the layers tree gives a node, which a row names the node it concerns by
  getNodeTitle: (nodeId: string) => string;
}

const { findings, getNodeTitle } = defineProps<Props>();
const emit = defineEmits<{ select: [nodeId: string] }>();
// The count is drawn in the colour of the worst finding, so one error reads as an error among warnings
const worstSeverity = computed(() =>
  findings.some(({ severity }) => severity === EditorFindingSeverity.Error)
    ? EditorFindingSeverity.Error
    : EditorFindingSeverity.Warning,
);
// A row's value is its finding's place in the list, since two findings can name the same node
const findingItems = computed<UiListItem<string>[]>(() =>
  findings.map(({ message, nodeId, severity }, index) => ({
    description: message,
    meaning: UiStatusIconMeaningMap[severity],
    title: getNodeTitle(nodeId),
    value: String(index),
  })),
);
</script>

<template>
  <UiPopover v-if="findings.length > 0" :label="`Problems: ${findings.length}`" :variant="UiButtonVariant.Quiet">
    <template #trigger>
      <UiIcon :meaning="UiStatusIconMeaningMap[worstSeverity]" />
      {{ findings.length }}
    </template>
    <template #default="{ close }">
      <UiList
        :items="findingItems"
        label="Problems"
        @select="
          (value) => {
            emit('select', takeOne(findings, Number(value)).nodeId);
            close();
          }
        "
      />
    </template>
  </UiPopover>
</template>
