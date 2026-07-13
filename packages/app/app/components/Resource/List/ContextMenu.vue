<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { useListDialogStore } from "@/store/resource/listDialog";
import { getResultAsync, noop, RoutePath } from "@esposter/shared";

interface ResourceListContextMenuProps {
  position: [number, number];
  resource: Resource;
}

const isOpen = defineModel<boolean>({ required: true });
const { position, resource } = defineProps<ResourceListContextMenuProps>();
const listDialogStore = useListDialogStore();
const { deletingId, renamingId } = storeToRefs(listDialogStore);
// Window is unreachable from the template, so these two handlers live in the script
const openInNewTab = () => {
  window.open(RoutePath.Resource(resource.id), "_blank");
};
const copyLink = () =>
  getResultAsync(() =>
    window.navigator.clipboard.writeText(`${window.location.origin}${RoutePath.Resource(resource.id)}`),
  ).match(noop, noop);
</script>

<template>
  <v-menu v-model="isOpen" :target="position">
    <v-list density="compact">
      <v-list-item prepend-icon="mdi-open-in-app" title="Open" :to="RoutePath.Resource(resource.id)" />
      <v-list-item prepend-icon="mdi-open-in-new" title="Open in new tab" @click="openInNewTab()" />
      <v-list-item prepend-icon="mdi-link-variant" title="Copy link" @click="copyLink()" />
      <v-divider />
      <v-list-item prepend-icon="mdi-pencil" title="Rename" @click="renamingId = resource.id" />
      <v-list-item base-color="error" prepend-icon="mdi-delete" title="Delete" @click="deletingId = resource.id" />
    </v-list>
  </v-menu>
</template>
