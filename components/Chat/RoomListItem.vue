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
const { deleteRoom } = roomStore;
const { currentRoomId } = storeToRefs(roomStore);
const onDeleteRoom = async () => {
  deleteRoom(room.id);
  await client.mutation("room.deleteRoom", { id: room.id });
};
const isHovering = ref(false);
const active = computed(() => room.id === currentRoomId.value);
</script>

<!-- @NOTE Route transitions doesn't like this component with invoke render outside of default slot :C -->
<template>
  <div position="relative" @mouseover="isHovering = true" @mouseleave="isHovering = false">
    <InvisibleNuxtLink :to="MESSAGES_PATH(room.id)">
      <v-list-item :active="active" :title="room.name" :value="room.id">
        <template #prepend>
          <v-badge m="r-4" color="green" location="bottom end" dot>
            <v-avatar v-if="room.avatar">
              <v-img :src="room.avatar" :alt="room.name" />
            </v-avatar>
            <DefaultAvatar v-else :name="room.name" />
          </v-badge>
        </template>
      </v-list-item>
    </InvisibleNuxtLink>
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
      @click="onDeleteRoom"
    />
  </div>
</template>
