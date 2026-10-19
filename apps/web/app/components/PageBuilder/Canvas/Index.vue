<script setup lang="ts">
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getPresentDefinitions } from "#shared/services/pageBuilder/getPresentDefinitions";
import { getWebpageCss } from "#shared/services/pageBuilder/getWebpageCss";
import { getNodeIdFromElement } from "@/services/pageBuilder/getNodeIdFromElement";
import { renderCanvasVNodes } from "@/services/pageBuilder/renderCanvasVNodes";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";

interface Props {
  resourceId: string;
}

const { resourceId } = defineProps<Props>();
const { origin } = useRequestURL();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const pageDocument = computed(() => pageBuilderDocumentStore.getDocument(resourceId));
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
      @click="
        pageBuilderCanvasStore.setSelectedNodeId(
          resourceId,
          getNodeIdFromElement($event.target as Element | null) ?? '',
        )
      "
    >
      <CanvasNodes :document="pageDocument" :origin />
    </div>
  </PageBuilderCanvasFrame>
</template>
