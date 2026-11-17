<script setup lang="ts">
import type { AnyPageBuilderKind } from "#src/models/pageBuilder/AnyPageBuilderKind";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getNodePointer } from "#src/services/pageBuilder/getNodePointer";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "#src/store/pageBuilder/history";
import { MimeCategory, ResourceType } from "@esposter/db-schema";
import { JsonPatchOperationType, noop } from "@esposter/shared";
import { getBlockNode } from "vue-block-editor-headless";
import { z } from "zod";

interface Props {
  // The kind the resource's document is edited through, which the shell passes beside the resource
  kind: AnyPageBuilderKind;
  resourceId: string;
}
const { kind, resourceId } = defineProps<Props>();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getHeldDocument } = pageBuilderDocumentStore;
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getSelectedNodeId } = pageBuilderCanvasStore;
const pageBuilderHistoryStore = usePageBuilderHistoryStore();
const { applyEdit } = pageBuilderHistoryStore;
const { formSchema, formValue, setFormValue } = usePageBuilderContent(
  kind,
  () => getHeldDocument(resourceId)?.document,
  () => resourceId,
);
// A block whose content is edited on the canvas, as an email's text block's is, or that has none, as a column has none, holds no field
const hasFields = computed(
  () => formSchema.value instanceof z.ZodObject && Object.keys(formSchema.value.shape).length > 0,
);
// The kind of file a selected webpage image or video takes, which its upload and picker offer; no other node takes one
const mediaCategory = computed(() => {
  const document = getHeldDocument(resourceId)?.document;
  const pointer = document && getNodePointer(kind, document, getSelectedNodeId(resourceId));
  const node = document && pointer !== undefined ? getBlockNode(document, pointer, kind.children) : undefined;
  if (node?.type === WebpageNodeType.Image) return MimeCategory.Image;
  if (node?.type === WebpageNodeType.Video) return MimeCategory.Video;
  return undefined;
});
// The address a file sets is written to the node it was picked for, which the selection may have left by the time an upload
// Lands. An edit records its history against that node's content, as a form edit does
const setSource = (nodeId: string, src: string) => {
  const document = getHeldDocument(resourceId)?.document;
  const pointer = document && getNodePointer(kind, document, nodeId);
  if (pointer === undefined) return;

  applyEdit(
    resourceId,
    [{ op: JsonPatchOperationType.Replace, path: `${pointer}/props/src`, value: src }],
    "Edit block",
    `content:${nodeId}`,
  ).match(noop, console.error);
};
</script>

<template>
  <!-- Nothing is drawn for a resource whose document is not held, since there is no node or root to edit -->
  <template v-if="formSchema && formValue">
    <PageBuilderMediaField
      v-if="mediaCategory"
      :category="mediaCategory"
      :resource-id
      :type="ResourceType.Webpage"
      @update="(src, nodeId) => setSource(nodeId, src)"
    />
    <UiSchemaForm
      v-if="hasFields"
      :model-value="formValue"
      :schema="formSchema"
      @update:model-value="(value) => setFormValue(value)"
    />
    <UiEmptyState
      v-else
      description="Edit this block on the canvas, or change how it looks in the Style tab."
      :meaning="UiIconMeaning.Edit"
      title="No content settings"
    />
  </template>
</template>
