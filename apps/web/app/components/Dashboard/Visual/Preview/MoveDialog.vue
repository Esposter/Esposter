<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { DASHBOARD_NO_COLUMNS } from "@/services/dashboard/constants";
import { findVisual } from "@/services/dashboard/visual/findVisual";
import { getVisualMoveTargets } from "@/services/dashboard/visual/getVisualMoveTargets";
import { useVisualStore } from "@/store/dashboard/visual";
import { getFirstFreeCell } from "vue-grid-layout-headless";

interface Props {
  visual: Visual;
}

const isOpen = defineModel<boolean>({ default: false });
const { visual } = defineProps<Props>();
const visualStore = useVisualStore();
const { moveVisual } = visualStore;
const { visuals } = storeToRefs(visualStore);
const targets = computed(() => getVisualMoveTargets(visuals.value, visual.id));
// The visual lands at the first free cell of the list it moves into, so the visuals already there stay where they are.
// The dashboard's own list is the empty value, and a group's list is the group's visuals
const moveTo = (targetGroupId: string) => {
  const groupId = targetGroupId || undefined;
  const targetVisuals =
    groupId === undefined ? visuals.value : (findVisual(visuals.value, { id: groupId })?.visuals ?? []);
  moveVisual({ id: visual.id }, groupId, getFirstFreeCell(targetVisuals, DASHBOARD_NO_COLUMNS, visual));
  isOpen.value = false;
};
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Move to" w="[min(24rem,90vw)]">
    <div p-3 flex flex-col gap-3>
      <UiRadioGroup
        label="Move to"
        :items="targets"
        @update:model-value="
          (targetGroupId) => {
            if (targetGroupId !== undefined) moveTo(targetGroupId);
          }
        "
      />
    </div>
  </UiDialog>
</template>
