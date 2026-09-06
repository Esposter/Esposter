<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { hasCapability } from "#shared/services/resource/hasCapability";
import { getSnapshotVersionId } from "@/services/resource/getSnapshotVersionId";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
const versionHistoryStore = useVersionHistoryStore();
const { isPending, versions } = storeToRefs(versionHistoryStore);
const { clearVersionHistory, readSnapshotHistory } = versionHistoryStore;
const { closeVersionHistory } = useVersionHistoryRoute();
// Only a publishable type has two channels to tell apart, so the filter exists where it means something and
// Nowhere else — on every other type the timeline is revisions and nothing but
const isPublishable = computed(() => hasCapability(resource.type, "publishable"));
const isPublishedOnly = ref(false);
const displayVersions = computed(() =>
  isPublishedOnly.value
    ? versions.value.filter(({ channel }) => channel === SnapshotChannel.Published)
    : versions.value,
);
onMounted(async () => {
  await readSnapshotHistory();
});
// The panel's state is the open resource's, and the panel is what opened it
onUnmounted(clearVersionHistory);
</script>

<template>
  <v-sheet b-0 b-s-1 b-border b-solid flex flex-col overflow-auto w="full sm:1/3">
    <div py-2 pl-4 pr-2 b-0 b-b-1 b-border b-solid flex gap-2 items-center>
      <span text-title-medium>Version history</span>
      <v-spacer />
      <StyledTooltipIconButton icon="mdi-close" text="Close version history" @click="closeVersionHistory" />
    </div>
    <div v-if="isPublishable" px-4 py-2>
      <v-chip filter :model-value="isPublishedOnly" size="small" @click="isPublishedOnly = !isPublishedOnly">
        Published only
      </v-chip>
    </div>
    <StyledSkeleton v-if="isPending && versions.length === 0" type="list-item-two-line@3" />
    <v-list v-else density="comfortable" lines="two">
      <!-- Current is always the first row, so the list is never empty on a resource that has just been created
        and the mental model — current, plus the points behind it — is there from the first visit -->
      <ResourceVersionHistoryCurrentListItem :resource />
      <ResourceVersionHistoryListItem
        v-for="snapshotVersion of displayVersions"
        :key="getSnapshotVersionId(snapshotVersion)"
        :resource
        :snapshot-version
      />
    </v-list>
    <ResourceVersionHistoryRestoreDialog :versions />
  </v-sheet>
</template>
