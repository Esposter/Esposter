<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

import { textNodeType } from "#shared/services/pageBuilder/textNodeType";
import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { noop } from "@esposter/shared";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { getBlockNode, updateBlockNodeProps } from "headless-block-editor";

interface Props {
  nodeId: string;
  resourceId: string;
}

const { nodeId, resourceId } = defineProps<Props>();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const pageBuilderHistoryStore = usePageBuilderHistoryStore();
const { getDocument } = pageBuilderDocumentStore;
const { setEditingNodeId } = pageBuilderCanvasStore;
const { applyEdit } = pageBuilderHistoryStore;
const getNodeContent = () => {
  const document = getDocument(resourceId);
  const nodePointer = document && getNodePointer(document, nodeId);
  const node = document && nodePointer !== undefined ? getBlockNode(document, nodePointer) : undefined;
  return node && textNodeType.propsSchema.parse(node.props).content;
};
// Each change is one props edit of the node's content, under one interaction, so the whole session is one history entry
const onUpdate = ({ editor }: { editor: Editor }) => {
  const document = getDocument(resourceId);
  const nodePointer = document && getNodePointer(document, nodeId);
  if (nodePointer === undefined) return;

  applyEdit(
    resourceId,
    updateBlockNodeProps(nodePointer, { content: editor.getJSON() }),
    "Edit text",
    `text:${nodeId}`,
  ).match(noop, console.error);
};
const editor = useEditor({ autofocus: "end", content: getNodeContent(), extensions: getNoteExtensions(), onUpdate });
// Escape ends the edit; the stop keeps the shell from acting on the same key
const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;

  event.stopPropagation();
  setEditingNodeId(resourceId, "");
};
</script>

<template>
  <div data-text-editor @keydown="onKeydown">
    <EditorContent :editor />
  </div>
</template>
