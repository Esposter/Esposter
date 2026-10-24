<script setup lang="ts">
import { getLayerTreeItems } from "@/services/pageBuilder/getLayerTreeItems";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";

interface Props {
  resourceId: string;
}
const { resourceId } = defineProps<Props>();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getOpenDocument } = pageBuilderDocumentStore;
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
// Nothing is drawn for a resource whose document is not held, or one the webpage schema refuses
const layerTreeItems = computed(() => {
  const open = getOpenDocument(resourceId);
  if (!open) return undefined;

  const result = open.kind.documentSchema.safeParse(open.document);
  return result.success ? getLayerTreeItems(open.kind, result.data) : undefined;
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
