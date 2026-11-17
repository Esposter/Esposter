<script setup lang="ts">
import type { TextNodeProps } from "#shared/models/pageBuilder/TextNodeProps";
import type { AnyPageBuilderKind } from "#src/models/pageBuilder/AnyPageBuilderKind";

import { getNoteExtensions } from "#shared/services/resource/note/getNoteExtensions";
import { getNodePointer } from "#src/services/pageBuilder/getNodePointer";
import { MergeFieldExtension } from "#src/services/pageBuilder/MergeFieldExtension";
import { autofocusEditor } from "#src/services/richTextEditor/autofocusEditor";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "#src/store/pageBuilder/history";
import { noop, omitUndefined } from "@esposter/shared";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { v7 } from "uuid";
import { getBlockNode, updateBlockNodeProps } from "vue-block-editor-headless";

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
const { getHeldDocument, getMergeFieldColumnsRef } = pageBuilderDocumentStore;
const { setEditingNodeId } = pageBuilderCanvasStore;
const { applyEdit } = pageBuilderHistoryStore;
const getNodeContent = () => {
  const document = getHeldDocument(resourceId)?.document;
  const nodePointer = document && getNodePointer(kind, document, nodeId);
  const node = document && nodePointer !== undefined ? getBlockNode(document, nodePointer, kind.children) : undefined;
  return node?.type === kind.textType ? (node.props as TextNodeProps).content : undefined;
};
// Each session is its own interaction, so its changes are one history entry and the next session is another one
const interactionId = v7();
const mergeFieldColumns = getMergeFieldColumnsRef(() => resourceId);
const editor = useEditor({
  ...omitUndefined({ content: getNodeContent() }),
  extensions: [...getNoteExtensions(), MergeFieldExtension.configure({ getColumns: () => mergeFieldColumns.value })],
  // The edit begins at the end of the text the reader chose to edit
  onCreate: ({ editor: createdEditor }) => {
    autofocusEditor(createdEditor, "end");
  },
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
// Escape ends the edit; the stop keeps the canvas from acting on the same key
const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;

  event.stopPropagation();
  setEditingNodeId(resourceId, "");
};
</script>

<template>
  <div data-text-editor="true" @keydown="onKeydown($event)">
    <EditorContent :="omitUndefined({ editor })" />
    <RichTextEditorSuggestions :editor />
  </div>
</template>
