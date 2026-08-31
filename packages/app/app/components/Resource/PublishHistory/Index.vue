<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { SnapshotChannelDefinitionMap } from "#shared/services/resource/SnapshotChannelDefinitionMap";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { getSnapshotVersionId } from "@/services/resource/getSnapshotVersionId";
import { usePublishHistoryDialogStore } from "@/store/resource/publishHistoryDialog";
import { RoutePath } from "@esposter/shared";

interface ResourcePublishHistoryProps {
  resource: Resource;
}

const { resource } = defineProps<ResourcePublishHistoryProps>();
const { $trpc } = useNuxtApp();
const publishHistoryDialogStore = usePublishHistoryDialogStore();
const { restoringSnapshotVersionId } = storeToRefs(publishHistoryDialogStore);
// Newest first, in the order the endpoint merged the two channels — by time rather than by version, because
// The channels number independently and an ordinal says nothing about where a row belongs once they share a list
const versions = ref(await $trpc.resource.readSnapshotHistory.query({ id: resource.id }));
// Only a published version has a route to preview it at: a revision is a point to return to, with no rendered
// Form of its own. The row is a data-table slot, so its link is keyed here rather than rebuilt on every render
const viewVersionToMap = computed(
  () =>
    new Map(
      versions.value
        .filter(({ channel }) => channel === SnapshotChannel.Published)
        .map(({ version }) => [version, { path: RoutePath.View(resource.type, resource.id), query: { version } }]),
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
      v-if="versions.length === 0"
      icon="mdi-cloud-clock-outline"
      title="No versions yet"
      description="Publish this resource or save a version to create its first snapshot."
    />
    <v-data-table v-else :headers :items="versions">
      <template #[`item.version`]="{ item }">
        <div flex gap-x-2 items-center>
          {{ SnapshotChannelDefinitionMap[item.channel].title }} v{{ item.version }}
          <v-chip v-if="item.isCurrent" color="primary" size="x-small" text="Current" />
          <span v-if="item.label" op-70>{{ item.label }}</span>
        </div>
      </template>
      <template #[`item.takenAt`]="{ item }">
        <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="item.takenAt" />
      </template>
      <template #[`item.actions`]="{ item }">
        <div flex gap-1 justify-end>
          <StyledTooltipIconButton
            v-if="item.channel === SnapshotChannel.Published"
            :to="viewVersionToMap.get(item.version)"
            icon="mdi-eye-outline"
            text="View version"
          />
          <StyledTooltipIconButton
            icon="mdi-restore"
            text="Restore to draft"
            @click="restoringSnapshotVersionId = getSnapshotVersionId(item)"
          />
        </div>
      </template>
    </v-data-table>
    <ResourcePublishHistoryRestoreDialog :resource :versions />
  </div>
</template>
