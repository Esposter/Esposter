<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useVisualStore } from "@/store/dashboard/visual";
import { getSynchronizedFunction } from "@esposter/shared";

interface Props {
  visual: Visual;
}

const { visual } = defineProps<Props>();
const visualStore = useVisualStore();
const { duplicateVisual, editItem } = visualStore;
const { editedItem } = storeToRefs(visualStore);
const container = useTemplateRef("container");

onClickExceptDrag(
  container,
  getSynchronizedFunction(() => editItem({ id: visual.id })),
);
</script>

<template>
  <div ref="container" size-full>
    <!-- The chart is drawn as it is published, but takes no pointer: a press on it is the tile's drag, and its click
      opens the edit form. The corner's actions and the error state's Retry sit above it again -->
    <div pointer-events-none size-full>
      <DashboardVisual :visual>
        <template #actions>
          <!-- Clicking the tile opens its edit form, which nothing on screen says on its own — Power BI puts a visual's
            Actions on the tile's own corner, so edit, duplicate and delete sit there here too. A press here never reaches
            The tile's drag tracking, and its click is the corner's own -->
          <div data-nested-interaction="true" flex gap-1 @mousedown.stop @mousemove.stop>
            <UiIconButton
              label="Edit visual"
              :meaning="UiIconMeaning.Edit"
              :variant="UiButtonVariant.Quiet"
              @click="editItem({ id: visual.id })"
            />
            <UiIconButton
              label="Duplicate visual"
              :meaning="UiIconMeaning.Copy"
              :variant="UiButtonVariant.Quiet"
              @click="duplicateVisual({ id: visual.id })"
            />
            <DashboardVisualPreviewDeleteButton :id="visual.id" :type="visual.type" />
          </div>
        </template>
      </DashboardVisual>
    </div>
    <DashboardVisualPreviewEditFormDialog v-if="editedItem?.id === visual.id" v-model="editedItem" />
  </div>
</template>
