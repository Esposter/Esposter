<script setup lang="ts">
import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";
import type { Resource } from "@esposter/db-schema";

import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { SnapshotReasonTitleMap } from "#shared/services/resource/SnapshotReasonTitleMap";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiToken } from "@/models/ui/UiToken";
import { getSnapshotVersionId } from "@/services/resource/getSnapshotVersionId";
import { getSnapshotVersionTitle } from "@/services/resource/getSnapshotVersionTitle";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";
import { SnapshotChannel } from "@esposter/db-schema";
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
  () => snapshotVersion.channel === SnapshotChannel.Published && checkHasCapability(resource.type, "publishable"),
);
// What the row says it is: why it was taken and one line about what is in it. A bare version and a time is not
// Something a person can choose between
const subtitle = computed(() =>
  [snapshotVersion.reason ? SnapshotReasonTitleMap[snapshotVersion.reason] : "", snapshotVersion.summary]
    .filter(Boolean)
    .join(" · "),
);
</script>

<template>
  <li flex gap-1 items-center :class="{ 'bg-accent/20': previewSnapshotVersionId === snapshotVersionId }">
    <component
      :is="isPreviewable ? 'button' : 'div'"
      :aria-current="previewSnapshotVersionId === snapshotVersionId || undefined"
      :type="isPreviewable ? 'button' : undefined"
      px-2
      py-1
      flex
      flex-1
      gap-2
      min-h-8
      min-w-0
      items-center
      :class="isPreviewable ? 'ui-item' : undefined"
      @click="isPreviewable ? previewSnapshot(snapshotVersionId) : undefined"
    >
      <span flex flex-1 gap-2 min-w-0 truncate items-center>
        {{ getSnapshotVersionTitle(snapshotVersion) }}
        <UiChip v-if="snapshotVersion.isCurrent" :token="UiToken.Success">Live</UiChip>
      </span>
      <span text-muted flex shrink-0 gap-x-2 items-center>
        <ResourceVersionHistoryTime :datetime="snapshotVersion.takenAt" />
        <span v-if="subtitle">· {{ subtitle }}</span>
      </span>
    </component>
    <UiTooltip v-if="snapshotVersion.isCurrent" #default="{ activatorProps }" label="Open public link">
      <UiButtonLink
        :="activatorProps"
        aria-label="Open public link"
        :to="RoutePath.View(resource.type, resource.id)"
        target="_blank"
        :variant="UiButtonVariant.Quiet"
        px-0
      >
        <span class="i-mdi:open-in-new" aria-hidden="true" size-6 />
      </UiButtonLink>
    </UiTooltip>
    <UiIconButton
      label="Restore this version"
      :meaning="UiIconMeaning.Refresh"
      :variant="UiButtonVariant.Quiet"
      @click="restoringSnapshotVersionId = snapshotVersionId"
    />
  </li>
</template>
