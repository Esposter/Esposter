<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";
import type { LinkPreviewResponse } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { useDataStore } from "@/store/message/data";
import { noop } from "@esposter/shared";

interface Props {
  linkPreviewResponse: LinkPreviewResponse;
  messageId: ClientMessage["id"];
  roomId: ClientMessage["roomId"];
}

const { messageId, roomId } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { getSlice } = dataStore;
const container = useTemplateRef("container");
const isHovered = useElementHover(container);
const isConfirmDialogOpen = ref(false);
const { executeMutation } = useMutation();
const deleteLinkPreviewResponse = async () => {
  // The message's own room rather than the one on screen — the thread pane renders another room's messages too
  const { items } = getSlice(roomId);
  await executeMutation(() => $trpc.message.deleteLinkPreviewResponse.mutate({ id: messageId, roomId }), {
    // Apply only the raw reactive change — the subscription echo re-runs MessageHookMap on success. The row and
    // Its embeds are read as the write is sent, so a rejected removal restores what the write ahead of it stored
    // Rather than what was on screen when the user confirmed
    applyOptimistic: () => {
      const message = items.value.find(getEntityIdEqualComparator(["id"], { id: messageId }));
      if (!message) return noop;

      const previousLinkPreviewResponse = message.linkPreviewResponse;
      message.linkPreviewResponse = null;
      return () => {
        message.linkPreviewResponse = previousLinkPreviewResponse;
      };
    },
    key: messageId,
  });
};
</script>

<template>
  <div ref="container" flex gap-1 items-start>
    <MessageModelMessageLinkPreview max-w-140 :="linkPreviewResponse" />
    <!-- Shown beside the embed it removes while the pointer is over it, and whenever the keyboard reaches it -->
    <UiIconButton
      :class="isHovered ? undefined : 'op-0 focus-visible:op-100'"
      label="Remove embeds"
      :meaning="UiIconMeaning.Remove"
      :variant="UiButtonVariant.Quiet"
      @click="isConfirmDialogOpen = true"
    />
    <UiConfirmDialog
      v-model="isConfirmDialogOpen"
      confirm-label="Remove All Embeds"
      title="Are you sure?"
      is-optimistic
      :confirm="deleteLinkPreviewResponse"
    >
      This will remove all embeds on this message for everyone.
    </UiConfirmDialog>
  </div>
</template>
