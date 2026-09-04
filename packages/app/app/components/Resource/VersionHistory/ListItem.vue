<script setup lang="ts">
import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";
import type { Resource } from "@esposter/db-schema";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { hasCapability } from "#shared/services/resource/hasCapability";
import { SnapshotReasonTitleMap } from "#shared/services/resource/SnapshotReasonTitleMap";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { getSnapshotVersionId } from "@/services/resource/getSnapshotVersionId";
import { getSnapshotVersionTitle } from "@/services/resource/getSnapshotVersionTitle";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";
import { RoutePath } from "@esposter/shared";

interface Props {
  resource: Resource;
  snapshotVersion: SnapshotVersion;
}

const { resource, snapshotVersion } = defineProps<Props>();
const versionHistoryStore = useVersionHistoryStore();
const { restoringSnapshotVersionId } = storeToRefs(versionHistoryStore);
const { previewSnapshot, previewSnapshotVersionId } = useVersionHistoryRoute();
const snapshotVersionId = computed(() => getSnapshotVersionId(snapshotVersion));
// Only a published snapshot has a rendered form of its own — the public renderer its type already registers.
// A revision is a point to return to, and reconstituting one into a read-only render of every type is a
// Surface that does not exist yet, so its row restores rather than previews
const isPreviewable = computed(
  () => snapshotVersion.channel === SnapshotChannel.Published && hasCapability(resource.type, "publishable"),
);
// What the row says it is, in the owner's words: why it was taken, what the owner named it, and one line about
// What is in it. A bare version and a time is not something a person can choose between
const subtitle = computed(() =>
  [
    snapshotVersion.reason ? SnapshotReasonTitleMap[snapshotVersion.reason] : "",
    snapshotVersion.label,
    snapshotVersion.summary,
  ]
    .filter(Boolean)
    .join(" · "),
);
</script>

<template>
  <v-list-item
    :active="previewSnapshotVersionId === snapshotVersionId"
    :link="isPreviewable"
    @click="isPreviewable ? previewSnapshot(snapshotVersionId) : undefined"
  >
    <template #title>
      <div flex flex-wrap gap-2 items-center>
        <span>{{ getSnapshotVersionTitle(snapshotVersion) }}</span>
        <v-chip v-if="snapshotVersion.isCurrent" color="success" size="x-small" text="Live" />
      </div>
    </template>
    <template #subtitle>
      <div flex flex-wrap gap-x-2 items-center>
        <v-tooltip location="top">
          <template #activator="{ props: tooltipActivatorProps }">
            <NuxtTime :="tooltipActivatorProps" :datetime="snapshotVersion.takenAt" relative />
          </template>
          <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="snapshotVersion.takenAt" />
        </v-tooltip>
        <span v-if="subtitle">· {{ subtitle }}</span>
      </div>
    </template>
    <template #append>
      <div flex gap-1>
        <StyledTooltipIconButton
          v-if="snapshotVersion.isCurrent"
          :to="RoutePath.View(resource.type, resource.id)"
          icon="mdi-open-in-new"
          target="_blank"
          text="Open public link"
        />
        <StyledTooltipIconButton
          icon="mdi-restore"
          text="Restore this version"
          @click.stop="restoringSnapshotVersionId = snapshotVersionId"
        />
      </div>
    </template>
  </v-list-item>
</template>
