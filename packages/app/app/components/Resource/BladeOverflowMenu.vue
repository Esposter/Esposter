<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { hasCapability } from "#shared/services/resource/hasCapability";

interface ResourceBladeOverflowMenuProps {
  duplicate: () => Promise<void>;
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  refresh: () => Promise<void>;
  resource: Resource;
  unpublish: () => Promise<void>;
}

const { duplicate, publication, publish, refresh, resource, unpublish } = defineProps<ResourceBladeOverflowMenuProps>();
// The dialogs live in the toolbar so they outlive this menu closing
const emit = defineEmits<{ delete: []; rename: []; share: [] }>();
const isPublishable = computed(() => hasCapability(resource.type, "publishable"));
const { exportFormats, importFormats } = usePortableFormats(() => resource);
const overflowItems = computed<Item[]>(() => [
  { icon: "mdi-refresh", onClick: () => refresh(), title: "Refresh" },
  { icon: "mdi-pencil", onClick: () => emit("rename"), title: "Rename" },
  { color: "error", icon: "mdi-delete", onClick: () => emit("delete"), title: "Delete" },
  { icon: "mdi-content-copy", onClick: () => duplicate(), title: "Duplicate" },
  ...(isPublishable.value
    ? [
        publication
          ? { icon: "mdi-cloud-off-outline", onClick: () => unpublish(), title: "Unpublish" }
          : { icon: "mdi-cloud-upload", onClick: () => publish(), title: "Publish" },
      ]
    : []),
  // An unpublished resource has no public URL, so there is nothing to share until it has one
  ...(isPublishable.value && publication
    ? [{ icon: "mdi-share-variant", onClick: () => emit("share"), title: "Share" }]
    : []),
  ...importFormats.value.map(({ import: importFormat, label }) => ({
    icon: "mdi-import",
    onClick: () => importFormat?.(),
    title: `Import ${label}`,
  })),
  ...exportFormats.value.map(({ export: exportFormat, label }) => ({
    icon: "mdi-export",
    onClick: () => exportFormat?.(),
    title: `Export ${label}`,
  })),
]);
</script>

<template>
  <StyledOverflowMenu icon="mdi-dots-horizontal" :items="overflowItems" />
</template>
