<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiDialogSize } from "@/models/ui/UiDialogSize";
import { getVisualMoveTargets } from "@/services/dashboard/visual/getVisualMoveTargets";
import { useVisualStore } from "@/store/dashboard/visual";

interface Props {
  visual: Visual;
}

const isOpen = defineModel<boolean>({ default: false });
const { visual } = defineProps<Props>();
const visualStore = useVisualStore();
const { moveVisual } = visualStore;
const { visuals } = storeToRefs(visualStore);
const targets = computed(() => getVisualMoveTargets(visuals.value, visual.id));
// A radio option's value is a string, so the dashboard's own option carries "", which the dialog converts to no group
const moveTo = (targetGroupId: string) => {
  moveVisual({ id: visual.id }, targetGroupId || undefined);
  isOpen.value = false;
};
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Move to" :size="UiDialogSize.Small">
    <UiRadioGroup
      label="Move to"
      :items="targets"
      @update:model-value="
        (targetGroupId) => {
          if (targetGroupId !== undefined) moveTo(targetGroupId);
        }
      "
    />
  </UiDialog>
</template>
