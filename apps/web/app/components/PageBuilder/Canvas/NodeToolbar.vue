<script setup lang="ts">
import { usePageBuilderMoves } from "@/composables/pageBuilder/usePageBuilderMoves";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getParentNodeId } from "@/services/pageBuilder/getParentNodeId";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useCommandStore } from "@/store/ui/command";

interface Props {
  announce: (message: string) => void;
  // Where the toolbar's top left sits in the app's document
  position: { left: number; top: number };
  resourceId: string;
}

const { announce, position, resourceId } = defineProps<Props>();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getSelectedNodeId, setSelectedNodeId } = pageBuilderCanvasStore;
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getDocument } = pageBuilderDocumentStore;
const commandStore = useCommandStore();
const { openCommandPalette } = commandStore;
const { deleteSelected, duplicateSelected, moveDown, moveToScope, moveUp } = usePageBuilderMoves(
  () => resourceId,
  announce,
);
// Registered while the toolbar is mounted, so the palette Move to… opens is scoped to this node's slots
useCommandScope(moveToScope);
const isDeleteOpen = ref(false);
// The node holding the selected one, which the selection moves to; the page itself clears the selection
const selectParent = () => {
  const document = getDocument(resourceId);
  const nodeId = getSelectedNodeId(resourceId);
  if (!document || !nodeId) return;

  const parentId = getParentNodeId(document, nodeId);
  if (parentId !== undefined) setSelectedNodeId(resourceId, parentId);
};
</script>

<!-- Above the selected node, so the toolbar never covers the node it acts on -->
<template>
  <div
    p-1
    b-border
    bg-background
    flex
    gap-1
    fixed
    class="-translate-y-full"
    :style="{ left: `${position.left}px`, top: `${position.top}px` }"
  >
    <UiIconButton label="Select parent" :meaning="UiIconMeaning.Collapse" @click="selectParent()" />
    <UiIconButton label="Move up" :meaning="UiIconMeaning.ArrowUp" @click="moveUp()" />
    <UiIconButton label="Move down" :meaning="UiIconMeaning.ArrowDown" @click="moveDown()" />
    <UiIconButton label="Move to…" :meaning="UiIconMeaning.Forward" @click="openCommandPalette()" />
    <UiIconButton label="Duplicate" :meaning="UiIconMeaning.Copy" @click="duplicateSelected()" />
    <UiIconButton label="Delete" :meaning="UiIconMeaning.Delete" @click="isDeleteOpen = true" />
  </div>
  <UiConfirmDialog
    v-model="isDeleteOpen"
    confirm-label="Delete"
    is-optimistic
    title="Delete node"
    :confirm="() => deleteSelected()"
  >
    <p>Delete this node and everything in it from the page?</p>
  </UiConfirmDialog>
</template>
