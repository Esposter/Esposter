<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { ResourceDialogsComponentMap } from "@/services/resource/ResourceDialogsComponentMap";

interface Props {
  activeBlade: string;
  resource: Resource;
}
// The resource itself is threaded because the page's own guard is what makes it non-optional; everything else
// The blade shows or does — the publication, the loading flag, every write — comes from the resource store
const { activeBlade, resource } = defineProps<Props>();
// Version history is a panel over whichever blade is open rather than a blade of its own, because the page
// Header is the one surface every type has — Sheet and TodoList have no editor to hang it off. Its state
// Is the route's, so the back button and a shared link both land on it. See /docs/resource/resource-snapshots
const { isVersionHistoryOpen, previewSnapshotVersionId } = useVersionHistoryRoute();
</script>

<!-- One box, not two: a list pane beside the blade would duplicate the way back the breadcrumb and the
     header's close ✕ both already give, and spend width the blade itself uses better -->
<template>
  <div flex flex-1 min-h-0>
    <!-- min-w-0 lets the box shrink below its content's intrinsic width so wide blades scroll internally -->
    <div flex flex-1 min-w-0>
      <div flex-1 min-w-0 of-auto>
        <!-- Preview in place: the version renders where the blade was, so stepping through candidates never
          leaves the resource -->
        <ResourceVersionHistoryPreview
          v-if="previewSnapshotVersionId"
          :key="previewSnapshotVersionId"
          :resource
          :snapshot-version-id="previewSnapshotVersionId"
        />
        <ResourceBladeOutlet v-else :active-blade :resource />
      </div>
      <ResourceVersionHistory v-if="isVersionHistoryOpen" :resource />
    </div>
    <component :is="ResourceDialogsComponentMap[resource.type]" v-if="ResourceDialogsComponentMap[resource.type]" />
  </div>
</template>
