<script setup lang="ts">
import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";

import { getSnapshotVersionId } from "@/services/resource/getSnapshotVersionId";
import { getSnapshotVersionTitle } from "@/services/resource/getSnapshotVersionTitle";
import { useVersionHistoryStore } from "@/store/resource/versionHistory";
import { withFinalizerAsync } from "@esposter/shared";

interface Props {
  versions: SnapshotVersion[];
}

const { versions } = defineProps<Props>();
const versionHistoryStore = useVersionHistoryStore();
const { restoringSnapshotVersionId } = storeToRefs(versionHistoryStore);
const { restoreSnapshot } = versionHistoryStore;
const { isOpen, item: restoringSnapshotVersion } = useSingletonDialog(restoringSnapshotVersionId, () =>
  versions.find((snapshotVersion) => getSnapshotVersionId(snapshotVersion) === restoringSnapshotVersionId.value),
);
const restore = async () => {
  if (!restoringSnapshotVersion.value) return;

  await restoreSnapshot(restoringSnapshotVersion.value);
};
// The row's own words, so the confirmation names the version the owner clicked
const restoringSnapshotVersionTitle = computed(() =>
  restoringSnapshotVersion.value ? getSnapshotVersionTitle(restoringSnapshotVersion.value) : "",
);
</script>

<template>
  <StyledFormDialog
    v-model="isOpen"
    :card-props="{ title: 'Restore version' }"
    :confirm-button-props="{ text: 'Restore' }"
    @submit="
      async (_event, onComplete) => {
        await withFinalizerAsync(restore, onComplete);
      }
    "
  >
    Restore <b>{{ restoringSnapshotVersionTitle }}</b> into the working draft? The draft it replaces becomes a version
    of its own first, so this can be undone — and the published version stays live until you re-publish.
  </StyledFormDialog>
</template>
