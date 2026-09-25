<script setup lang="ts">
import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
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
const isRestoring = ref(false);
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Restore version" w="[min(32rem,90vw)]">
    <div p-3 flex flex-col gap-3>
      <p>
        Restore <strong>{{ restoringSnapshotVersionTitle }}</strong> into the working draft? The draft it replaces
        becomes a version of its own first, so this can be undone — and the published version stays live until you
        re-publish.
      </p>
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" autofocus @click="isOpen = false">Cancel</UiButton>
        <UiButton
          :is-pending="isRestoring"
          :variant="UiButtonVariant.Accent"
          @click="
            async () => {
              isRestoring = true;
              await withFinalizerAsync(restore, () => {
                isRestoring = false;
                isOpen = false;
              });
            }
          "
        >
          Restore
        </UiButton>
      </footer>
    </div>
  </UiDialog>
</template>
