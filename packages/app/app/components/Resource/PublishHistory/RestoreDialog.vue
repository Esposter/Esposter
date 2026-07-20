<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { useNotificationStore } from "@/store/notification";
import { usePublishHistoryDialogStore } from "@/store/resource/publishHistoryDialog";
import { RoutePath, withFinalizerAsync } from "@esposter/shared";

interface ResourcePublishHistoryRestoreDialogProps {
  resource: Resource;
}

const { resource } = defineProps<ResourcePublishHistoryRestoreDialogProps>();
const { $trpc } = useNuxtApp();
const publishHistoryDialogStore = usePublishHistoryDialogStore();
const { restoringVersion } = storeToRefs(publishHistoryDialogStore);
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
const { executeMutation: executeRestoreMutation } = useMutation();
const isOpen = useSingletonDialog(restoringVersion);
const restore = async () => {
  const version = Number(restoringVersion.value);
  await executeRestoreMutation(() => $trpc.resource.restorePublishedVersion.mutate({ id: resource.id, version }), {
    // Every restore overwrites this resource's single working draft, so it keys by the resource id
    key: resource.id,
    onError: createErrorNotification,
    onSuccess: async () => {
      createNotification({ severity: "success", title: `Restored "${resource.name}" from v${version} into a draft` });
      // Land in the editor so the owner reviews the restored draft before deciding to re-publish
      await navigateTo(`${RoutePath.Resource(resource.id)}/${ResourceBladeType.Editor}`);
    },
  });
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
    Restore <b>v{{ restoringVersion }}</b> into the working draft? This overwrites the current draft content — the
    published version stays live until you re-publish.
  </StyledFormDialog>
</template>
