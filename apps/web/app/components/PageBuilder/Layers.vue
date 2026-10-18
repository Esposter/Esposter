<script setup lang="ts">
import { webpageDocumentSchema } from "#shared/services/pageBuilder/webpageDocumentSchema";
import { getLayerTreeItems } from "@/services/pageBuilder/getLayerTreeItems";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";

interface Props {
  resourceId: string;
}
const { resourceId } = defineProps<Props>();
const { getDocument } = usePageBuilderDocumentStore();
const { getSelectedNodeId, setSelectedNodeId } = usePageBuilderCanvasStore();
// Nothing is drawn for a resource whose document is not held, or one the webpage schema refuses
const layerTreeItems = computed(() => {
  const result = webpageDocumentSchema.safeParse(getDocument(resourceId));
  return result.success ? getLayerTreeItems(result.data) : undefined;
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
