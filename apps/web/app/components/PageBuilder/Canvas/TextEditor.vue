<script setup lang="ts">
import type { TextNodeProps } from "#shared/models/pageBuilder/TextNodeProps";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
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
const { getOpenDocument } = pageBuilderDocumentStore;
const { setEditingNodeId } = pageBuilderCanvasStore;
const { applyEdit } = pageBuilderHistoryStore;
const getNodeContent = () => {
  const open = getOpenDocument(resourceId);
  const nodePointer = open && getNodePointer(open.kind, open.document, nodeId);
  const node =
    open && nodePointer !== undefined ? getBlockNode(open.document, nodePointer, open.kind.children) : undefined;
  return node?.type === WebpageNodeType.Text ? node.props.content : undefined;
};
// Each session is its own interaction, so its changes are one history entry and the next session is another one
const interactionId = crypto.randomUUID();
const editor = useEditor({
  autofocus: "end",
  content: getNodeContent(),
  extensions: getNoteExtensions(),
  onUpdate: ({ editor: currentEditor }) => {
    const open = getOpenDocument(resourceId);
    const nodePointer = open && getNodePointer(open.kind, open.document, nodeId);
    if (nodePointer === undefined) return;

    applyEdit(
      resourceId,
      updateBlockNodeProps<TextNodeProps>(nodePointer, { content: currentEditor.getJSON() }),
      "Edit text",
      interactionId,
    ).match(noop, console.error);
  },
});
// Escape ends the edit; the stop keeps the shell from acting on the same key
const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;

  event.stopPropagation();
  setEditingNodeId(resourceId, "");
};
</script>

<template>
  <div data-text-editor="true" @keydown="onKeydown($event)">
    <EditorContent :editor />
  </div>
</template>
