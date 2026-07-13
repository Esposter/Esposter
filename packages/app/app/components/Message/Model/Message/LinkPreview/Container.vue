<script setup lang="ts">
import type { LinkPreviewResponse, MessageEntity } from "@esposter/db-schema";

interface ContainerProps {
  linkPreviewResponse: LinkPreviewResponse;
  partitionKey: MessageEntity["partitionKey"];
  rowKey: MessageEntity["rowKey"];
}

const { linkPreviewResponse, partitionKey, rowKey } = defineProps<ContainerProps>();
const { $trpc } = useNuxtApp();
const isActive = ref(false);
const executeMutation = useMutation();
// Embed removal applies via the subscription echo — non-optimistic
const deleteLinkPreviewResponse = async (onComplete: () => void) => {
  await executeMutation(() => $trpc.message.deleteLinkPreviewResponse.mutate({ partitionKey, rowKey }));
  onComplete();
};
</script>

<template>
  <div flex @mouseenter="isActive = true" @mouseleave="isActive = false">
    <MessageModelMessageLinkPreview max-w-140 :="linkPreviewResponse" />
    <StyledDeleteFormDialog
      :card-props="{
        title: 'Are you sure?',
        text: 'This will remove all embeds on this message for everyone.',
      }"
      :confirm-button-props="{ text: 'Remove All Embeds' }"
      @delete="deleteLinkPreviewResponse"
    >
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
