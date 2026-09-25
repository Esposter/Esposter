<script setup lang="ts">
import type { LinkPreviewResponse, MessageEntity } from "@esposter/db-schema";

import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { useDataStore } from "@/store/message/data";
import { noop } from "@esposter/shared";

interface Props {
  linkPreviewResponse: LinkPreviewResponse;
  partitionKey: MessageEntity["partitionKey"];
  rowKey: MessageEntity["rowKey"];
}

const { linkPreviewResponse, partitionKey, rowKey } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { getSlice } = dataStore;
const isActive = ref(false);
const isConfirmDialogOpen = ref(false);
const { executeMutation } = useMutation();
const deleteLinkPreviewResponse = async (onComplete: () => void) => {
  // The message's own room rather than the one on screen — the thread pane renders another room's messages too
  const { items } = getSlice(partitionKey);
  await executeMutation(() => $trpc.message.deleteLinkPreviewResponse.mutate({ partitionKey, rowKey }), {
    // Apply only the raw reactive change — the subscription echo re-runs MessageHookMap on success. The row and
    // Its embeds are read as the write is sent, so a rejected removal restores what the write ahead of it stored
    // Rather than what was on screen when the user confirmed
    applyOptimistic: () => {
      const message = items.value.find(getEntityIdEqualComparator(CompositeAzureKeyPath, { partitionKey, rowKey }));
      if (!message) return noop;

      const previousLinkPreviewResponse = message.linkPreviewResponse;
      message.linkPreviewResponse = null;
      return () => {
        message.linkPreviewResponse = previousLinkPreviewResponse;
      };
    },
    key: rowKey,
  });
  onComplete();
};
</script>

<template>
  <div flex gap-1 items-start @mouseenter="isActive = true" @mouseleave="isActive = false">
    <MessageModelMessageLinkPreview max-w-140 :="linkPreviewResponse" />
    <!-- Shown beside the embed it removes while the pointer is over it, and whenever the keyboard reaches it -->
    <UiIconButton
      :class="isActive ? undefined : 'op-0 focus-visible:op-100'"
      label="Remove embeds"
      :meaning="UiIconMeaning.Remove"
      :variant="UiButtonVariant.Quiet"
      @click="isConfirmDialogOpen = true"
    />
    <UiConfirmDialog
      v-model="isConfirmDialogOpen"
      confirm-label="Remove All Embeds"
      title="Are you sure?"
      @confirm="(onComplete) => deleteLinkPreviewResponse(onComplete)"
    >
      This will remove all embeds on this message for everyone.
    </UiConfirmDialog>
  </div>
</template>
