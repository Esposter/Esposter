<script setup lang="ts">
import type { AnyPageBuilderKind } from "@/models/pageBuilder/AnyPageBuilderKind";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { useCommandStore } from "@/store/ui/command";

interface Props {
  announce: (message: string) => void;
  // The kind the resource's document is edited through, which the shell passes beside the resource
  kind: AnyPageBuilderKind;
  // Where the toolbar's top left sits in the app's document
  position: { left: number; top: number };
  resourceId: string;
}

const { announce, kind, position, resourceId } = defineProps<Props>();
const commandStore = useCommandStore();
const { openCommandPalette } = commandStore;
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getDocument } = pageBuilderDocumentStore;
const { deleteSelected, duplicateSelected, moveDown, moveToScope, moveUp } = usePageBuilderMoves(
  kind,
  () => getDocument(resourceId),
  () => resourceId,
  announce,
);
// Registered while the toolbar is mounted, so the palette Move to… opens is scoped to this node's slots
useCommandScope(moveToScope);
const { selectParent } = usePageBuilderSelection(
  kind,
  () => getDocument(resourceId),
  () => resourceId,
);
const isDeleteOpen = ref(false);
</script>

<!-- Placed by the canvas above the selected node, or below it when the frame has no room above -->
<template>
  <div p-1 b-border bg-background flex gap-1 fixed :style="{ left: `${position.left}px`, top: `${position.top}px` }">
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
