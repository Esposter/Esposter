<script setup lang="ts">
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";
import type { WebpageKind } from "@/models/pageBuilder/WebpageKind";

import { getLayerTreeItems } from "@/services/pageBuilder/getLayerTreeItems";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";

interface Props {
  getDocument: () => undefined | WebpageDocument;
  kind: WebpageKind;
  resourceId: string;
}

const { getDocument, kind, resourceId } = defineProps<Props>();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
// Nothing is drawn for a resource whose document is not held, or one the kind's schema refuses
const layerTreeItems = computed(() => {
  const document = getDocument();
  if (!document) return undefined;

  const result = kind.documentSchema.safeParse(document);
  return result.success ? getLayerTreeItems(kind, result.data) : undefined;
});
const selectedNodeId = computed({
  get: () => getSelectedNodeId(resourceId),
  set: (nodeId: string) => {
    setSelectedNodeId(resourceId, nodeId);
  },
});
</script>

<template>
  <UiTree v-if="layerTreeItems" v-model="selectedNodeId" label="Layers" :items="layerTreeItems" />
</template>
