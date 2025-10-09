<script setup lang="ts">
import type { LinkPreviewResponse, MessageEntity } from "@esposter/db";

interface ContainerProps {
  linkPreviewResponse: LinkPreviewResponse;
  partitionKey: MessageEntity["partitionKey"];
  rowKey: MessageEntity["rowKey"];
}

const { linkPreviewResponse, partitionKey, rowKey } = defineProps<ContainerProps>();
const { $trpc } = useNuxtApp();
const isActive = ref(false);
</script>

<template>
  <div flex @mouseenter="isActive = true" @mouseleave="isActive = false">
    <MessageModelMessageLinkPreview max-w-140 :="linkPreviewResponse" />
    <StyledDeleteDialog
      :card-props="{
        title: 'Are you sure?',
        text: 'This will remove all embeds on this message for everyone.',
      }"
      :confirm-button-props="{ text: 'Remove All Embeds' }"
      @delete="
        async (onComplete) => {
          try {
            await $trpc.message.deleteLinkPreviewResponse.mutate({ partitionKey, rowKey });
          } finally {
            onComplete();
          }
        }
      "
    >
      <template #activator="{ updateIsOpen }">
        <v-btn
          v-if="isActive"
          density="comfortable"
          icon="mdi-close"
          size="small"
          variant="plain"
          :ripple="false"
          @click="updateIsOpen(true)"
        />
      </template>
    </StyledDeleteDialog>
  </div>
</template>
