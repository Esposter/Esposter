<script setup lang="ts">
import type { LinkPreviewResponse, MessageEntity } from "@esposter/db-schema";

import { getIsEntityIdEqualComparator } from "#shared/services/entity/getIsEntityIdEqualComparator";
import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { useDataStore } from "@/store/message/data";

interface ContainerProps {
  linkPreviewResponse: LinkPreviewResponse;
  partitionKey: MessageEntity["partitionKey"];
  rowKey: MessageEntity["rowKey"];
}

const { linkPreviewResponse, partitionKey, rowKey } = defineProps<ContainerProps>();
const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const isActive = ref(false);
const { executeMutation } = useMutation();
const deleteLinkPreviewResponse = async (onComplete: () => void) => {
  const message = items.value.find(getIsEntityIdEqualComparator(CompositeAzureKeyPath, { partitionKey, rowKey }));
  const previousLinkPreviewResponse = message?.linkPreviewResponse;
  await executeMutation(() => $trpc.message.deleteLinkPreviewResponse.mutate({ partitionKey, rowKey }), {
    // Apply only the raw reactive change — the subscription echo re-runs MessageHookMap on success.
    applyOptimistic: () => {
      if (message) message.linkPreviewResponse = null;
      return () => {
        if (message && previousLinkPreviewResponse !== undefined)
          message.linkPreviewResponse = previousLinkPreviewResponse;
      };
    },
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
        <v-btn
          :class="isActive ? undefined : 'invisible'"
          density="comfortable"
          icon="mdi-close"
          size="small"
          variant="plain"
          :ripple="false"
          @click="updateIsOpen(true)"
        />
      </template>
    </StyledDeleteFormDialog>
  </div>
</template>
