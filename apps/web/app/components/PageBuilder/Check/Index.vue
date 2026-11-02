<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { ID_SEPARATOR, takeOne } from "@esposter/shared";

interface Props {
  resourceId: string;
}

const { resourceId } = defineProps<Props>();
const { critiqueRows } = usePageBuilderCritique(() => resourceId);
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { setSelectedNodeId } = pageBuilderCanvasStore;
// A row's value leads with the node it names, whose id holds no separator, so the node is the value's first part
const selectCritiqueRow = (rowValue: string) => setSelectedNodeId(resourceId, takeOne(rowValue.split(ID_SEPARATOR)));
</script>

<template>
  <UiList v-if="critiqueRows.length > 0" :items="critiqueRows" label="Findings" @select="selectCritiqueRow" />

  <UiEmptyState
    v-else
    :meaning="UiIconMeaning.Success"
    title="No findings"
    description="The checks read contrast, fixed widths and survey invites, and found nothing to report in them"
  />
</template>
