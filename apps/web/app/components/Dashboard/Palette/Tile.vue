<script setup lang="ts">
import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { checkIsGroupTooDeep } from "@/services/dashboard/visual/checkIsGroupTooDeep";
import { useVisualStore } from "@/store/dashboard/visual";
import { startExternalDrag } from "vue-grid-layout-headless";

interface Props {
  title: string;
  type: VisualType;
}

const { type } = defineProps<Props>();
const visualStore = useVisualStore();
const { addVisual, createVisual } = visualStore;
const { visuals: dashboardVisuals } = storeToRefs(visualStore);
const button = useTemplateRef("button");
// A press that moves is a drag that drops the visual where it is released, and a press that does not is a click that adds
// The first free cell, so the drag never adds a second visual through its click
onClickExceptDrag(
  computed(() => button.value?.element),
  () => {
    createVisual(type);
  },
);
</script>

<template>
  <UiButton
    ref="button"
    :style="{ touchAction: 'none' }"
    :variant="UiButtonVariant.Quiet"
    @pointerdown="
      (event) => {
        // Dropped on a group's grid, the visual is added inside that group, and on the dashboard's own grid it is added at the top.
        // A group dropped on a group at the depth cap is refused by that grid, so it pushes nothing aside for a group it will not add
        startExternalDrag(
          event,
          new Visual({ type }),
          (cell, target) => addVisual(type, cell, target.dataset.groupId),
          (_item, target) => type === VisualType.Group && checkIsGroupTooDeep(dashboardVisuals, target.dataset.groupId),
        );
      }
    "
  >
    <UiIcon :meaning="UiIconMeaning.Chart" />
    {{ title }}
  </UiButton>
</template>
