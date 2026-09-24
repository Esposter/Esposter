<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getSnapshotVersionId } from "@/services/resource/getSnapshotVersionId";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";
import { SnapshotChannel } from "@esposter/db-schema";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
const versionHistoryStore = useVersionHistoryStore();
const { isPending, versions } = storeToRefs(versionHistoryStore);
const { clearVersionHistory, readSnapshotHistory } = versionHistoryStore;
const { closeVersionHistory } = useVersionHistoryRoute();
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
onUnmounted(() => {
  clearVersionHistory();
});
</script>

<!-- A panel beside the blade, on a guide line down its start edge. Its one filter sits in the heading's row beside the
     close mark, rather than on a row of its own -->
<template>
  <aside aria-label="Version history" w="full sm:1/3" flex flex-col ui-guide of-auto ui-body>
    <div py-2 pl-3 pr-2 flex gap-1 items-center>
      <h2 flex-1 min-w-0 truncate ui-heading>Version history</h2>
      <!-- Only a publishable type has two channels to tell apart, so the filter exists where it means something and
        nowhere else — on every other type the timeline is revisions and nothing but -->
      <UiIconButton
        v-if="checkHasCapability(resource.type, 'publishable')"
        :aria-pressed="isPublishedOnly"
        label="Published only"
        :meaning="UiIconMeaning.Filter"
        :variant="UiButtonVariant.Quiet"
        @click="isPublishedOnly = !isPublishedOnly"
      />
      <UiIconButton
        label="Close version history"
        :meaning="UiIconMeaning.Close"
        :variant="UiButtonVariant.Quiet"
        @click="closeVersionHistory"
      />
    </div>
    <div v-if="isPending && versions.length === 0" aria-busy="true" p-1 flex flex-col gap-1>
      <UiSkeleton v-for="index of 3" :key="index" h-8 />
    </div>
    <ul v-else p-1 flex flex-col>
      <!-- Current is always the first row, so the list is never empty on a resource that has just been created
        and the mental model — current, plus the points behind it — is there from the first visit -->
      <ResourceVersionHistoryCurrentListItem :resource />
      <ResourceVersionHistoryListItem
        v-for="snapshotVersion of displayVersions"
        :key="getSnapshotVersionId(snapshotVersion)"
        :resource
        :snapshot-version
      />
    </ul>
    <ResourceVersionHistoryRestoreDialog :versions />
  </aside>
</template>
