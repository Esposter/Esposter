<script setup lang="ts">
import type { UiTabItem } from "@/models/ui/UiTabItem";

import { usePageBuilderHistoryCommands } from "@/composables/pageBuilder/usePageBuilderHistoryCommands";
import { usePageBuilderMoves } from "@/composables/pageBuilder/usePageBuilderMoves";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { checkIsEditableTarget } from "@/util/dom/checkIsEditableTarget";

interface Props {
  resourceId: string;
}

const MIN_SIDE_PANE_WIDTH = 200;
const MAX_SIDE_PANE_WIDTH = 480;
const DEFAULT_SIDE_PANE_WIDTH = 260;
const CONTENT_PANEL = "Content";
const panelItems: UiTabItem<string>[] = [{ title: CONTENT_PANEL, value: CONTENT_PANEL }];

const { resourceId } = defineProps<Props>();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const pageDocument = computed(() => pageBuilderDocumentStore.getDocument(resourceId));
const leftWidth = ref(DEFAULT_SIDE_PANE_WIDTH);
const rightWidth = ref(DEFAULT_SIDE_PANE_WIDTH);
const panel = ref(CONTENT_PANEL);
// The one live region every announcement goes through. Clearing first lets a repeat of the same text be announced again
const announcement = ref("");
const announce = (message: string) => {
  announcement.value = "";
  nextTick(() => {
    announcement.value = message;
  });
};
const { deleteSelected, moveDown, moveLeft, moveRight, moveUp } = usePageBuilderMoves(() => resourceId, announce);
usePageBuilderHistoryCommands(() => resourceId);

// The move an Alt chord makes with an arrow key, or none for any other key
const getAltMove = (key: string) => {
  switch (key) {
    case "ArrowDown":
      return moveDown;
    case "ArrowLeft":
      return moveLeft;
    case "ArrowRight":
      return moveRight;
    case "ArrowUp":
      return moveUp;
    default:
      return undefined;
  }
};
// Keys are not taken while the user types in a field, so Delete and the arrows keep their own meaning there
const onKeydown = (event: KeyboardEvent) => {
  if (checkIsEditableTarget(event.target)) return;

  if (event.altKey) {
    const move = getAltMove(event.key);
    if (!move) return;

    event.preventDefault();
    move();
    return;
  }
  if (event.key !== "Delete" && event.key !== "Backspace") return;

  event.preventDefault();
  deleteSelected();
};
</script>

<template>
  <div v-if="pageDocument" flex gap-2 h-full min-h-0 @keydown="onKeydown">
    <div :style="{ width: `${leftWidth}px` }" relative flex flex-col gap-4 shrink-0 min-h-0>
      <div flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto>
        <PageBuilderPalette :announce :resource-id />
        <PageBuilderLayers :resource-id />
      </div>
      <UiResizeHandle
        v-model="leftWidth"
        label="Resize the palette and layers"
        :max="MAX_SIDE_PANE_WIDTH"
        :min="MIN_SIDE_PANE_WIDTH"
      />
    </div>
    <div flex flex-col gap-2 flex-1 min-w-0 min-h-0>
      <PageBuilderCanvasDeviceToggle :resource-id />
      <PageBuilderEmptyPage v-if="pageDocument.content.length === 0" :announce :resource-id />
      <PageBuilderCanvas v-else :announce :resource-id />
    </div>
    <div :style="{ width: `${rightWidth}px` }" relative shrink-0 min-h-0>
      <UiResizeHandle
        v-model="rightWidth"
        is-reversed
        label="Resize the content panel"
        :max="MAX_SIDE_PANE_WIDTH"
        :min="MIN_SIDE_PANE_WIDTH"
      />
      <UiTabs v-model="panel" is-filling :items="panelItems" label="Node settings" h-full>
        <PageBuilderContentPanel :resource-id />
      </UiTabs>
    </div>
    <div role="status" aria-live="polite" sr-only>{{ announcement }}</div>
  </div>
</template>
