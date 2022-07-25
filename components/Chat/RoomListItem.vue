<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { MESSAGES_PATH } from "@/util/constants";
import type { Room } from "@prisma/client";

interface ChatRoomListItemProps {
  room: Room;
}

const { room } = defineProps<ChatRoomListItemProps>();
const client = useClient();
const { currentRoomId, deleteRoom } = useRoomStore();
const removeRoom = async () => {
  deleteRoom(room.id);
  await client.mutation("room.deleteRoom", { id: room.id });
};
const isHovering = ref(false);
const active = computed(() => currentRoomId === room.id);
</script>

<!-- @NOTE Route transitions doesn't like this component with invoke render outside of default slot :C -->
<template>
  <div position="relative" @mouseover="isHovering = true" @mouseleave="isHovering = false">
    <v-list-item :active="active" :title="room.name" @click="navigateTo(MESSAGES_PATH(room.id))">
      <template #prepend>
        <v-badge m="r-4" color="green" location="bottom end" dot>
          <v-list-item-avatar v-if="room.avatar">
            <v-img :src="room.avatar" :alt="room.name" />
          </v-list-item-avatar>
          <DefaultAvatar v-else :name="room.name" />
        </v-badge>
      </template>
    </v-list-item>
    <v-btn
      v-show="isHovering"
      position="absolute"
      top="1/2"
      right="0"
      translate-y="-1/2"
      bg="transparent!"
      icon="mdi-close"
      size="small"
      flat
      @click="removeRoom"
    />
  </div>
</template>
