<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getSnapshotVersionTitle } from "@/services/resource/getSnapshotVersionTitle";
import { parseSnapshotVersionId } from "@/services/resource/parseSnapshotVersionId";
import { ViewComponentMap } from "@/services/resource/ViewComponentMap";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";
import { SnapshotChannel } from "@esposter/db-schema";

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
const viewComponent = computed(() => {
  const { type } = resource;
  if (checkHasCapability(type, "publishable")) return ViewComponentMap[type];
  else return undefined;
});
// The public renderer reads the published channel by version, so it can only be handed a published version — a
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
    <UiAlert status="info" m-2>
      <!-- The line never wraps: the sentence yields its width, and the way back is the banner's own close mark -->
      <div flex gap-2 items-center>
        <span flex-1 min-w-0 truncate>Previewing {{ title }} — the current draft is untouched</span>
        <UiButton :variant="UiButtonVariant.Accent" @click="restoringSnapshotVersionId = snapshotVersionId">
          Restore
        </UiButton>
        <UiIconButton
          label="Back to current"
          :meaning="UiIconMeaning.Close"
          :variant="UiButtonVariant.Quiet"
          @click="stopPreviewingSnapshot()"
        />
      </div>
    </UiAlert>
    <div flex-1 min-w-0 of-auto>
      <UiEmptyState
        v-if="!publishedVersion || !viewComponent"
        description="This version has no rendered form of its own — restore it to see its content."
        :meaning="UiIconMeaning.Hide"
        title="Nothing to preview"
      />
      <Suspense v-else>
        <component :is="viewComponent" :id="resource.id" :version="publishedVersion" />
        <template #fallback>
          <UiSkeleton h-full />
        </template>
      </Suspense>
    </div>
  </div>
</template>
