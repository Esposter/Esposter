<script setup lang="ts">
import { Room } from "@/server/trpc/room";
import { useRoomStore } from "@/store/useRoomStore";
import { MESSAGES_PATH } from "@/util/constants";

interface ChatRoomListProps {
  room: Room;
}

const { room } = defineProps<ChatRoomListProps>();
const client = useClient();
const { currentRoomId, deleteRoom } = useRoomStore();
const removeRoom = async () => {
  deleteRoom(room.id);
  await client.mutation("room.deleteRoom", { id: room.id });
};
const active = ref(false);
</script>

<template>
  <div position="relative" @mouseover="active = true" @mouseleave="active = false">
    <v-list-item :active="currentRoomId === room.id" :title="room.name" @click="navigateTo(MESSAGES_PATH(room.id))">
      <template #prepend>
        <v-badge m="r-4" color="green" location="bottom end" dot>
          <v-list-item-avatar>
            <v-img :src="room.avatar" :alt="room.name" />
          </v-list-item-avatar>
        </v-badge>
      </template>
    </v-list-item>
    <v-btn
      v-if="active"
      position="absolute"
      top="1/2"
      right="0"
      translate-y="-1/2"
      bg="transparent"
      icon="mdi-close"
      size="small"
      flat
      @click="removeRoom"
    />
  </div>
</template>
