<script setup lang="ts">
import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { LinkPreviewResponse } from "@esposter/db-schema";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useDataStore } from "#src/store/message/data";

interface Props {
  linkPreviewResponse: LinkPreviewResponse;
  messageId: ClientMessage["id"];
  roomId: ClientMessage["roomId"];
}

const { messageId, roomId } = defineProps<Props>();
const dataStore = useDataStore();
const { deleteLinkPreviewResponse } = dataStore;
const container = useTemplateRef("container");
const isHovered = useElementHover(container);
const isConfirmDialogOpen = ref(false);
// The embed leaves the message once the room answers the removal, and a refused removal leaves it under the alert
const removeLinkPreviewResponse = () => deleteLinkPreviewResponse({ id: messageId, roomId });
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
      :awaited-because="AwaitedReason.ServerDecidedOutcome"
      confirm-label="Remove All Embeds"
      title="Are you sure?"
      :confirm="removeLinkPreviewResponse"
    >
      This will remove all embeds on this message for everyone.
    </UiConfirmDialog>
  </div>
</template>
