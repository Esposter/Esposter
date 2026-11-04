<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { DashboardGridTransfer } from "@/models/dashboard/DashboardGridTransfer";
import type { CollisionMode, CompactType, GridBlock } from "vue-grid-layout-headless";

import { useVisualStore } from "@/store/dashboard/visual";
import { getSynchronizedFunction } from "@esposter/shared";

interface Props {
  collision: CollisionMode;
  compactType: CompactType;
  visual: Visual;
}

const { collision, compactType, visual } = defineProps<Props>();
// A group's commits, opens and transfers come up from its grid, and a child group's come up from its own container, so each
// Container passes what it hears from either on to its caller
const emit = defineEmits<{
  commit: [changes: GridBlock[]];
  open: [visual: Visual];
  transfer: [transfer: DashboardGridTransfer];
}>();
const visualStore = useVisualStore();
const { editItem } = visualStore;
const container = useTemplateRef("container");

onClickExceptDrag(
  container,
  getSynchronizedFunction(() => editItem({ id: visual.id })),
);
</script>

<template>
  <div
    ref="container"
    size-full
    cursor-pointer
    ui-frame
    active="not-focus-within:[background-image:var(--ui-pressed-overlay)]"
  >
    <!-- The chart is drawn as it is published, but takes no pointer: a press on it is the tile's drag, and its click
      opens the edit form. The corner's menu sits above it again -->
    <div size-full pointer-events-none>
      <DashboardVisual
        is-editable
        :collision
        :compact-type
        :visual
        @commit="(changes) => emit('commit', changes)"
        @open="(child) => emit('open', child)"
        @transfer="(transfer) => emit('transfer', transfer)"
      >
        <template #actions="{ dataset }">
          <!-- Clicking the tile opens its edit form, which nothing on screen says on its own, so the one menu on the corner
            holds the edit beside the occasional actions. A press here never reaches the tile's drag tracking -->
          <div data-nested-interaction="true" flex gap-1 @mousedown.stop @mousemove.stop>
            <DashboardVisualPreviewActionsMenu :dataset :visual />
          </div>
        </template>
        <template #child="{ visual: child }">
          <DashboardVisualPreviewContainer
            :collision
            :compact-type
            :visual="child"
            @commit="(changes) => emit('commit', changes)"
            @open="(openedVisual) => emit('open', openedVisual)"
            @transfer="(transfer) => emit('transfer', transfer)"
          />
        </template>
      </DashboardVisual>
    </div>
  </div>
</template>
