<script setup lang="ts">
import type { SnapshotVersion } from "#shared/models/resource/SnapshotVersion";
import type { Resource } from "@esposter/db-schema";

import { SnapshotChannelDefinitionMap } from "#shared/services/resource/SnapshotChannelDefinitionMap";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { getSnapshotVersionId } from "@/services/resource/getSnapshotVersionId";
import { useNotificationStore } from "@/store/notification";
import { usePublishHistoryDialogStore } from "@/store/resource/publishHistoryDialog";
import { NotificationSeverity } from "@esposter/db-schema";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

interface ResourcePublishHistoryRestoreDialogProps {
  resource: Resource;
  versions: SnapshotVersion[];
}

const { resource, versions } = defineProps<ResourcePublishHistoryRestoreDialogProps>();
const { $trpc } = useNuxtApp();
const publishHistoryDialogStore = usePublishHistoryDialogStore();
const { restoringSnapshotVersionId } = storeToRefs(publishHistoryDialogStore);
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
const { executeMutation: executeRestoreMutation } = useMutation();
const { isOpen, item: restoringVersion } = useSingletonDialog(restoringSnapshotVersionId, () =>
  versions.find((version) => getSnapshotVersionId(version) === restoringSnapshotVersionId.value),
);
// The row's own words, so the confirmation names the version the owner clicked rather than an ordinal that
// Means something different on each channel
const restoringVersionTitle = computed(() =>
  restoringVersion.value
    ? `${SnapshotChannelDefinitionMap[restoringVersion.value.channel].title} v${restoringVersion.value.version}`
    : "",
);
const restore = async () => {
  if (!restoringVersion.value) return;

  const { channel, version } = restoringVersion.value;
  const title = restoringVersionTitle.value;
  await executeRestoreMutation(
    () => $trpc.resource.restoreSnapshotVersion.mutate({ channel, id: resource.id, version }),
    {
      // Every restore overwrites this resource's single working draft, so it keys by the resource id
      key: resource.id,
      onError: createErrorNotification,
      onSuccess: async () => {
        createNotification({
          severity: NotificationSeverity.Success,
          title: `Restored "${resource.name}" from ${title} into a draft`,
        });
        // Land in the editor so the owner reviews the restored draft before deciding to re-publish
        await navigateTo(`${RoutePath.Resource(resource.id)}/${ResourceBladeType.Editor}`);
      },
    },
  );
};
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
    Restore <b>{{ restoringVersionTitle }}</b> into the working draft? This overwrites the current draft content — the
    published version stays live until you re-publish.
  </StyledFormDialog>
</template>
