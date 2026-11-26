<script setup lang="ts">
import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { LinkPreviewResponse } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useLinkPreviewDialogStore } from "#src/store/message/linkPreviewDialog";

interface Props {
  linkPreviewResponse: LinkPreviewResponse;
  messageId: ClientMessage["id"];
  roomId: ClientMessage["roomId"];
}

defineProps<Props>();
const linkPreviewDialogStore = useLinkPreviewDialogStore();
const { removingMessageId, removingRoomId } = storeToRefs(linkPreviewDialogStore);
const container = useTemplateRef("container");
const isHovered = useElementHover(container);
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
      @click="() => {
        removingMessageId = messageId;
        removingRoomId = roomId;
      }"
    />
  </div>
</template>
