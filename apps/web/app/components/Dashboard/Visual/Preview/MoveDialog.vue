<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { UiDialogPlacement } from "#src/models/ui/UiDialogPlacement";
import { UiDialogSize } from "#src/models/ui/UiDialogSize";
import { getVisualMoveTargets } from "#src/services/dashboard/visual/getVisualMoveTargets";
import { useVisualStore } from "#src/store/dashboard/visual";

interface Props {
  visual: Visual;
}

const isOpen = defineModel<boolean>({ default: false });
const { visual } = defineProps<Props>();
const visualStore = useVisualStore();
const { moveVisual } = visualStore;
const { visuals } = storeToRefs(visualStore);
const targets = computed(() => getVisualMoveTargets(visuals.value, visual.id));
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Move to" :size="UiDialogSize.Small">
    <UiRadioGroup
      label="Move to"
      :items="targets"
      @update:model-value="
        (targetGroupId) => {
          if (targetGroupId !== undefined) {
            // A radio option's value is a string, so the dashboard's own option carries an empty one, which the dialog
            // Converts to no group
            moveVisual({ id: visual.id }, targetGroupId || undefined);
            isOpen = false;
          }
        }
      "
    />
  </UiDialog>
</template>
