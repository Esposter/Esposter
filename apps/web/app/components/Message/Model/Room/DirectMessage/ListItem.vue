<script setup lang="ts">
import type { UiItem } from "@/models/ui/UiItem";
import type { RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useDirectMessageStore } from "@/store/message/room/directMessage";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const directMessageName = useDirectMessageName(() => room);
const directMessageStore = useDirectMessageStore();
const { hideDirectMessage } = directMessageStore;
const { currentDirectMessageId } = storeToRefs(directMessageStore);
const isActive = computed(() => room.id === currentDirectMessageId.value);
// The one action a conversation has, which its close button and its context menu share
const contextMenuItems: UiItem[] = [
  { meaning: UiIconMeaning.Close, onClick: () => hideDirectMessage(room.id), title: "Close conversation" },
];
</script>

<template>
  <MessageModelRoomBaseListItem :context-menu-items :is-active :name="directMessageName" :room-id="room.id">
    <template #actions>
      <UiIconButton
        label="Close conversation"
        :meaning="UiIconMeaning.Close"
        :variant="UiButtonVariant.Quiet"
        @click="hideDirectMessage(room.id)"
      />
    </template>
  </MessageModelRoomBaseListItem>
</template>
