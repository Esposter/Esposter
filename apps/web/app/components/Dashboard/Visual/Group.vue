<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { DashboardVisualEmits } from "@/models/dashboard/DashboardVisualEmits";
import type { CollisionMode, CompactType } from "vue-grid-layout-headless";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import {
  DASHBOARD_EDITOR_ROW_HEIGHT,
  DASHBOARD_NO_COLUMNS,
  DASHBOARD_PUBLISHED_ROW_HEIGHT,
} from "@/services/dashboard/constants";
import { getBreakpointColumnNumber } from "@/services/dashboard/grid/getBreakpointColumnNumber";
import { getGroupTitle } from "@/services/dashboard/visual/getGroupTitle";

interface Props {
  collision: CollisionMode;
  compactType: CompactType;
  // Drawn for editing, where the grid takes edits and the header always shows, since it is the group's place to be grabbed
  isEditable?: true;
  visual: Visual;
}

// The panel's border is the renderer's frame around it. Each child is drawn by the caller's child slot, so the group draws it
// The way its own dashboard does
defineSlots<{ default: (props: { visual: Visual }) => unknown }>();
const { isEditable, visual } = defineProps<Props>();
const emit = defineEmits<DashboardVisualEmits>();
const container = useTemplateRef("container");
const { width } = useElementSize(container);
const title = computed(() => visual.chart.configuration.title);
const groupTitle = computed(() => getGroupTitle(visual));
const visuals = computed(() => visual.visuals ?? []);
// The editor's grid is the full twelve columns, and a published group reflows by its own width, as the dashboard does
const columnNumber = computed(() => (isEditable ? DASHBOARD_NO_COLUMNS : getBreakpointColumnNumber(width.value)));
const rowHeight = computed(() => (isEditable ? DASHBOARD_EDITOR_ROW_HEIGHT : DASHBOARD_PUBLISHED_ROW_HEIGHT));
</script>

<template>
  <div ref="container" flex flex-col size-full role="group" :aria-label="groupTitle">
    <!-- The header keeps clear of the corner's menu, and a published group without a title has no header to draw -->
    <header v-if="isEditable || title" py-1 pe-10 ps-3 min-w-0 ui-bar>
      <p text-sm truncate :class="{ 'text-muted': !title }">{{ groupTitle }}</p>
    </header>
    <div flex-1 min-h-0 relative of-y-auto>
      <UiEmptyState
        v-if="isEditable && visuals.length === 0"
        pointer-events-none
        inset-0
        absolute
        :meaning="UiIconMeaning.Group"
        description="Or choose Move to in a visual's menu"
        title="Drop a visual here"
      />
      <!-- The grid takes its own presses, so a press inside it is the grid's and the group is moved by its header and frame.
        The grid's root is the nested interaction the outer grid's click passes over, so a click on a child opens the child -->
      <DashboardGrid
        v-if="isEditable || width"
        :collision
        :column-number
        :compact-type
        :data-group-id="visual.id"
        data-nested-interaction="true"
        :is-editable
        min-h-full
        pointer-events-auto
        :row-height
        :visuals
        @commit="(changes) => emit('commit', changes)"
        @open="(child) => emit('open', child)"
        @transfer="(transfer) => emit('transfer', transfer)"
      >
        <template #default="{ visual: child }">
          <slot :visual="child" />
        </template>
      </DashboardGrid>
    </div>
  </div>
</template>
