<script setup lang="ts">
import type { TextNodeProps } from "#shared/models/pageBuilder/TextNodeProps";
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";

import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { MergeFieldExtension } from "@/services/pageBuilder/MergeFieldExtension";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";
import { noop } from "@esposter/shared";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { getBlockNode, updateBlockNodeProps } from "headless-block-editor";

interface Props {
  // The kind the resource's document is edited through, which names the type of the node whose content is edited here
  kind: AnyPageBuilderKind;
  nodeId: string;
  resourceId: string;
}

const { kind, nodeId, resourceId } = defineProps<Props>();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const pageBuilderHistoryStore = usePageBuilderHistoryStore();
const { getHeldDocument } = pageBuilderDocumentStore;
const { setEditingNodeId } = pageBuilderCanvasStore;
const { applyEdit } = pageBuilderHistoryStore;
const getNodeContent = () => {
  const document = getHeldDocument(resourceId)?.document;
  const nodePointer = document && getNodePointer(kind, document, nodeId);
  const node = document && nodePointer !== undefined ? getBlockNode(document, nodePointer, kind.children) : undefined;
  return node?.type === kind.textType ? (node.props as TextNodeProps).content : undefined;
};
// Each session is its own interaction, so its changes are one history entry and the next session is another one
const interactionId = crypto.randomUUID();
const mergeFieldColumns = useMergeFieldColumns(() => resourceId);
const editor = useEditor({
  autofocus: "end",
  content: getNodeContent(),
  extensions: [...getNoteExtensions(), MergeFieldExtension.configure({ getColumns: () => mergeFieldColumns.value })],
  onUpdate: ({ editor: currentEditor }) => {
    const document = getHeldDocument(resourceId)?.document;
    const nodePointer = document && getNodePointer(kind, document, nodeId);
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
    <RichTextEditorSuggestions :editor />
  </div>
</template>
