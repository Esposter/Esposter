<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { MESSAGES_PATH } from "@/util/constants";
import type { Room } from "@prisma/client";
import { storeToRefs } from "pinia";

interface ChatRoomListItemProps {
  room: Room;
}

const { room } = defineProps<ChatRoomListItemProps>();
const client = useClient();
const roomStore = useRoomStore();
const { createOrUpdateRoom } = roomStore;
const { currentRoomId } = storeToRefs(roomStore);
const isHovering = ref(false);
const active = computed(() => room.id === currentRoomId.value);
const onUpdateRoom = async () => {
  // @NOTE Change this back to just Date once we add superjson
  const updatedRoom = await client.mutation("room.updateRoom", { id: room.id, updatedAt: new Date().toISOString() });
  createOrUpdateRoom(updatedRoom);
  navigateTo(MESSAGES_PATH(room.id));
};
</script>

<!-- @NOTE Route transitions doesn't like this component with invoke render outside of default slot :C -->
<template>
  <div position="relative" @mouseover="isHovering = true" @mouseleave="isHovering = false">
    <v-list-item :active="active" :title="room.name" @click="onUpdateRoom">
      <template #prepend>
        <v-badge m="r-4" color="green" location="bottom end" dot>
          <v-avatar v-if="room.avatar">
            <v-img :src="room.avatar" :alt="room.name" />
          </v-avatar>
          <DefaultAvatar v-else :name="room.name" />
        </v-badge>
      </template>
    </v-list-item>
    <ChatDeleteRoomButton
      v-show="isHovering"
      position="absolute"
      top="1/2"
      right="0"
      translate-y="-1/2"
      bg="transparent!"
      :roomId="room.id"
    />
  </div>
</template>
