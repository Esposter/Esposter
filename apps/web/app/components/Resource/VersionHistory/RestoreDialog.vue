<script setup lang="ts">
import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "#src/models/ui/UiDialogPlacement";
import { UiDialogSize } from "#src/models/ui/UiDialogSize";
import { getSnapshotVersionId } from "#src/services/resource/getSnapshotVersionId";
import { getSnapshotVersionTitle } from "#src/services/resource/getSnapshotVersionTitle";
import { useVersionHistoryStore } from "#src/store/resource/versionHistory";

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
const { answer, isPending } = useDialogAnswer(isOpen);
</script>

<!-- Raw rather than StyledDialog: this Cancel takes focus when the dialog opens, the safe answer to a restore, and the
     styled shell's Cancel does not -->
<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Restore version" :size="UiDialogSize.Medium">
    <p>
      Restore <strong>{{ restoringSnapshotVersionTitle }}</strong> into the working draft? The draft it replaces becomes
      a version of its own first, so this can be undone — and the published version stays live until you re-publish.
    </p>
    <template #footer>
      <UiButton is-autofocus :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <UiButton :is-pending :variant="UiButtonVariant.Accent" @click="answer(restore)"> Restore </UiButton>
    </template>
  </UiDialog>
</template>
