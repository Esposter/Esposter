<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { useVisualStore } from "@/store/dashboard/visual";
import { getSynchronizedFunction } from "@esposter/shared";

interface Props {
  visual: Visual;
}

const { visual } = defineProps<Props>();
const visualStore = useVisualStore();
const { editItem } = visualStore;
const container = useTemplateRef("container");

onClickExceptDrag(
  container,
  getSynchronizedFunction(() => editItem({ id: visual.id })),
);
</script>

<template>
  <div ref="container" size-full>
    <!-- The chart is drawn as it is published, but takes no pointer: a press on it is the tile's drag, and its click
      opens the edit form. The corner's menu sits above it again -->
    <div size-full pointer-events-none>
      <DashboardVisual :visual>
        <template #actions="{ dataset }">
          <!-- Clicking the tile opens its edit form, which nothing on screen says on its own, so the one menu on the corner
            holds the edit beside the occasional actions. A press here never reaches the tile's drag tracking -->
          <div data-nested-interaction="true" flex gap-1 @mousedown.stop @mousemove.stop>
            <DashboardVisualPreviewActionsMenu :dataset :visual />
          </div>
        </template>
      </DashboardVisual>
    </div>
  </div>
</template>
