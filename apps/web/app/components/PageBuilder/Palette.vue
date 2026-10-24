<script setup lang="ts">
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { FrameGeometry } from "@/models/pageBuilder/FrameGeometry";
import type { WebpageKind } from "@/models/pageBuilder/WebpageKind";

interface Props {
  announce: (message: string) => void;
  getDocument: () => undefined | WebpageDocument;
  // Both are the editor's, so a palette with no canvas beside it, as on an empty page, takes clicks alone
  getFrameGeometry?: () => FrameGeometry | undefined;
  kind: WebpageKind;
  resourceId: string;
  startPaletteDrag?: (
    type: WebpageNodeType,
    event: PointerEvent,
    getFrameGeometry: () => FrameGeometry | undefined,
  ) => void;
}
const { announce, getDocument, getFrameGeometry, kind, resourceId, startPaletteDrag } = defineProps<Props>();
const { insert } = usePageBuilderInsert(kind, getDocument, () => resourceId, announce);

// A press starts a drag only where a frame can take the block, so a press that has no frame stays a click
const startDrag = (type: WebpageNodeType, event: PointerEvent) => {
  if (!getFrameGeometry || !startPaletteDrag || getFrameGeometry() === undefined) return;

  startPaletteDrag(type, event, getFrameGeometry);
};
</script>

<template>
  <div flex flex-col gap-4>
    <section v-for="{ category, types } of kind.paletteCategories" :key="category" flex flex-col gap-2>
      <h3 text-sm text-muted>{{ category }}</h3>
      <div flex flex-wrap gap-2>
        <UiButton v-for="type of types" :key="type" @click="insert(type)" @pointerdown="startDrag(type, $event)">{{
          kind.titles[type]
        }}</UiButton>
      </div>
    </section>
  </div>
</template>
