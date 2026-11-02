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

// The delete's confirm is held by the editor, which binds no key while it asks
const isDeleteOpen = defineModel<boolean>("isDeleteOpen", { default: false });
const { announce, kind, position, resourceId } = defineProps<Props>();
const commandStore = useCommandStore();
const { openCommandPalette } = commandStore;
const pageBuilderDocumentStore = usePageBuilderDocumentStore();
const { getHeldDocument } = pageBuilderDocumentStore;
// The document the resource holds under either kind, as the shell's keyboard commands read it, so a webpage's and an email's toolbar act alike
const getPageDocument = () => getHeldDocument(resourceId)?.document;
const { deleteSelected, duplicateSelected, moveDown, moveToScope, moveUp } = usePageBuilderMoves(
  kind,
  getPageDocument,
  () => resourceId,
  announce,
);
// Registered while the toolbar is mounted, so the palette Move to… opens is scoped to this node's slots
useCommandScope(moveToScope);
const { selectParent } = usePageBuilderSelection(kind, getPageDocument, () => resourceId);
// A confirm open when its toolbar goes is gone with it, so the editor's keys are bound again rather than held by a dialog nobody sees
onBeforeUnmount(() => {
  isDeleteOpen.value = false;
});
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
