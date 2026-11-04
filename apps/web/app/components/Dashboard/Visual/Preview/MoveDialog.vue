<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
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
// The dashboard's own list is the empty value, and a group's list is the group's visuals. The store places the visual
// At the first free cell of the list it moves into
const moveTo = (targetGroupId: string) => {
  moveVisual({ id: visual.id }, targetGroupId || undefined);
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
