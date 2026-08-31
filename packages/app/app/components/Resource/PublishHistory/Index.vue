<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { usePublishHistoryDialogStore } from "@/store/resource/publishHistoryDialog";
import { RoutePath } from "@esposter/shared";

interface ResourcePublishHistoryProps {
  resource: Resource;
}

const { resource } = defineProps<ResourcePublishHistoryProps>();
const { $trpc } = useNuxtApp();
const publishHistoryDialogStore = usePublishHistoryDialogStore();
const { restoringVersion } = storeToRefs(publishHistoryDialogStore);
const versions = ref(await $trpc.resource.readSnapshotHistory.query({ id: resource.id }));
// Newest snapshot first, matching the order the publish flow stacks versions
const items = computed(() => versions.value.toSorted((first, second) => second.version - first.version));
// The row is a data-table slot, so its link is keyed here rather than rebuilt on every render of the table
const viewVersionToMap = computed(
  () =>
    new Map(
      items.value.map(({ version }) => [
        version,
        { path: RoutePath.View(resource.type, resource.id), query: { version } },
      ]),
    ),
);
const headers = [
  { key: "version", title: "Version" },
  { key: "takenAt", title: "Taken" },
  { key: "actions", sortable: false, title: "" },
];
</script>

<template>
  <div p-4 flex flex-col gap-4>
    <StyledEmptyState
      v-if="items.length === 0"
      icon="mdi-cloud-clock-outline"
      title="No published versions"
      description="Publish this resource to create its first snapshot."
    />
    <v-data-table v-else :headers :items>
      <template #[`item.version`]="{ item }">
        <div flex gap-x-2 items-center>
          v{{ item.version }}
          <v-chip v-if="item.isCurrent" color="primary" size="x-small" text="Current" />
        </div>
      </template>
      <template #[`item.takenAt`]="{ item }">
        <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="item.takenAt" />
      </template>
      <template #[`item.actions`]="{ item }">
        <div flex gap-1 justify-end>
          <StyledTooltipIconButton
            :to="viewVersionToMap.get(item.version)"
            icon="mdi-eye-outline"
            text="View version"
          />
          <StyledTooltipIconButton
            icon="mdi-restore"
            text="Restore to draft"
            @click="restoringVersion = String(item.version)"
          />
        </div>
      </template>
    </v-data-table>
    <ResourcePublishHistoryRestoreDialog :resource />
  </div>
</template>
