<script setup lang="ts">
import type { LinkPreviewResponse, MessageEntity } from "@esposter/db-schema";

import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
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
const { items } = storeToRefs(dataStore);
const isActive = ref(false);
const { executeMutation } = useMutation();
const deleteLinkPreviewResponse = async (onComplete: () => void) => {
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
  <div flex @mouseenter="isActive = true" @mouseleave="isActive = false">
    <MessageModelMessageLinkPreview max-w-140 :="linkPreviewResponse" />
    <StyledDeleteFormDialog
      :card-props="{ title: 'Are you sure?' }"
      :confirm-button-props="{ text: 'Remove All Embeds' }"
      @delete="deleteLinkPreviewResponse"
    >
      This will remove all embeds on this message for everyone.
      <template #activator="{ updateIsOpen }">
        <StyledTooltipIconButton
          :class="isActive ? undefined : 'invisible'"
          icon="mdi-close"
          text="Close"
          :button-props="{ density: 'comfortable', ripple: false, size: 'small', variant: 'plain' }"
          @click="updateIsOpen(true)"
        />
      </template>
    </StyledDeleteFormDialog>
  </div>
</template>
