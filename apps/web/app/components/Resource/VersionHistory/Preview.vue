<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { getSnapshotVersionTitle } from "@/services/resource/getSnapshotVersionTitle";
import { parseSnapshotVersionId } from "@/services/resource/parseSnapshotVersionId";
import { ViewComponentMap } from "@/services/resource/ViewComponentMap";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";

interface Props {
  resource: Resource;
  snapshotVersionId: string;
}

const { resource, snapshotVersionId } = defineProps<Props>();
const versionHistoryStore = useVersionHistoryStore();
const { restoringSnapshotVersionId } = storeToRefs(versionHistoryStore);
const { stopPreviewingSnapshot } = useVersionHistoryRoute();
const snapshotVersion = computed(() => parseSnapshotVersionId(snapshotVersionId));
// The type's own public renderer, matched against a runtime resource type the way the public view route
// Matches its own route param — a type with no renderer previews nothing, and its rows never offer to
const viewComponent = computed(
  () => Object.entries(ViewComponentMap).find(([viewType]) => viewType === resource.type)?.[1],
);
// The public renderer addresses `{id}/published/{version}`, so it can only be handed a published version — a
// Revision's number would render whichever published snapshot happens to share it, and the two channels number
// Independently. A revision has no rendered form here and falls to the empty state, whose Restore is the way to
// See it; the banner still names it, because what is being previewed is what the route asked for
const publishedVersion = computed(() =>
  snapshotVersion.value?.channel === SnapshotChannel.Published ? snapshotVersion.value.version : undefined,
);
const title = computed(() => (snapshotVersion.value ? getSnapshotVersionTitle(snapshotVersion.value) : ""));
</script>

<template>
  <div flex flex-col h-full>
    <!-- The banner is what turns restore from a button people fear into browsing: the version renders where the
      blade was, and the two ways out of it sit on top of what is being looked at -->
    <v-alert density="compact" rounded="0" type="info">
      <div flex flex-wrap gap-2 items-center>
        <span>Previewing {{ title }} — the current draft is untouched</span>
        <v-spacer />
        <StyledButton
          :button-props="{ prependIcon: 'mdi-restore', text: 'Restore this version', variant: 'text' }"
          @click="restoringSnapshotVersionId = snapshotVersionId"
        />
        <StyledButton :button-props="{ text: 'Back to current', variant: 'text' }" @click="stopPreviewingSnapshot" />
      </div>
    </v-alert>
    <div flex-1 min-w-0 overflow-auto>
      <StyledEmptyState
        v-if="!publishedVersion || !viewComponent"
        description="This version has no rendered form of its own — restore it to see its content."
        icon="mdi-eye-off-outline"
        title="Nothing to preview"
      />
      <Suspense v-else>
        <component :is="viewComponent" :id="resource.id" :version="publishedVersion" />
        <template #fallback>
          <StyledSkeleton />
        </template>
      </Suspense>
    </div>
  </div>
</template>
