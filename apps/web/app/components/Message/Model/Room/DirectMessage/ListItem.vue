<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

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
</script>

<template>
  <MessageModelRoomBaseListItem :is-active :name="directMessageName" :room-id="room.id">
    <template #append="{ isHovering }">
      <StyledLinkRowActions>
        <v-btn
          v-show="isActive || isHovering"
          density="compact"
          icon="mdi-close"
          variant="plain"
          size="small"
          :ripple="false"
          @click="hideDirectMessage(room.id)"
        />
      </StyledLinkRowActions>
    </template>
  </MessageModelRoomBaseListItem>
</template>
