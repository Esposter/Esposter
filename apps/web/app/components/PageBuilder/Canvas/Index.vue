<script setup lang="ts">
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { OverlayBox } from "@/services/pageBuilder/getOverlayBox";

import { getPresentDefinitions } from "#shared/services/pageBuilder/getPresentDefinitions";
import { getWebpageCss } from "#shared/services/pageBuilder/getWebpageCss";
import { getNodeIdFromElement } from "@/services/pageBuilder/getNodeIdFromElement";
import { renderCanvasVNodes } from "@/services/pageBuilder/renderCanvasVNodes";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { getFrameScale } from "vue-canvas-frame-headless";

interface Props {
  announce: (message: string) => void;
  resourceId: string;
}

const { announce, resourceId } = defineProps<Props>();
const { origin } = useRequestURL();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const pageDocument = computed(() => pageBuilderDocumentStore.getDocument(resourceId));
const selectedNodeId = computed(() => pageBuilderCanvasStore.getSelectedNodeId(resourceId));
const contentRoot = useTemplateRef("contentRoot");
// The node under the pointer, held here rather than in the store since only this canvas outlines it
const hoveredNodeId = ref<string>();
const selectionBox = ref<OverlayBox>();
const getElement = (nodeId: string) =>
  contentRoot.value?.ownerDocument.querySelector(`[data-node-id="${CSS.escape(nodeId)}"]`) ?? null;
// The toolbar sits in the app's document, so the selection box is mapped into the app's viewport through the frame's element
// The frame is scaled to fit its pane while the box is in the frame's own unscaled pixels, so the scale applies to the box
const toolbarPosition = computed(() => {
  const frameElement = contentRoot.value?.ownerDocument.defaultView?.frameElement;
  if (!(frameElement instanceof HTMLIFrameElement) || !selectionBox.value) return undefined;

  const scale = getFrameScale(frameElement.parentElement?.clientWidth ?? 0, frameElement.offsetWidth);
  const frameRect = frameElement.getBoundingClientRect();
  return {
    left: frameRect.left + selectionBox.value.left * scale,
    top: frameRect.top + selectionBox.value.top * scale,
  };
});
const css = computed(() =>
  pageDocument.value ? getWebpageCss(pageDocument.value, getPresentDefinitions(pageDocument.value)) : "",
);
const device = computed(() => pageBuilderCanvasStore.getDevice(resourceId));
// The nodes are rendered by the frame's content, so the render is a functional component over the document it draws
const CanvasNodes = (props: { document: WebpageDocument; origin: string }) =>
  renderCanvasVNodes(props.document, { origin: props.origin });
</script>

<template>
  <PageBuilderCanvasFrame v-if="pageDocument" :css :device title="Page">
    <div
      ref="contentRoot"
      relative
      @click="
        pageBuilderCanvasStore.setSelectedNodeId(
          resourceId,
          getNodeIdFromElement($event.target as Element | null) ?? '',
        )
      "
      @pointerleave="hoveredNodeId = undefined"
      @pointerover="hoveredNodeId = getNodeIdFromElement($event.target as Element | null)"
    >
      <CanvasNodes :document="pageDocument" :origin />
      <PageBuilderCanvasOverlays
        v-model:selection-box="selectionBox"
        :get-element
        :hovered-node-id
        :resource-id
        :selected-node-id
      />
    </div>
  </PageBuilderCanvasFrame>
  <PageBuilderCanvasNodeToolbar
    v-if="selectedNodeId && toolbarPosition"
    :announce
    :position="toolbarPosition"
    :resource-id
  />
</template>
