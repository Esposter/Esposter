<script setup lang="ts">
import { ChatRoom } from "@/components/Chat/types";
import { useRoomStore } from "@/store/useRoomStore";
import { MESSAGES_PATH } from "@/util/constants";

interface Props {
  chatRooms: ChatRoom[];
}

const { chatRooms } = defineProps<Props>();
const roomStore = useRoomStore();
</script>

<template>
  <v-list lines="two">
    <template v-for="(room, index) in chatRooms" :key="room.title">
      <v-list-item
        :active="roomStore.currentRoomId === room.id"
        :title="room.title"
        :subtitle="room.subtitle"
        @click="navigateTo(MESSAGES_PATH(room.id))"
      >
        <template #prepend>
          <v-list-item-avatar><v-img :src="room.avatar" /></v-list-item-avatar>
        </template>
      </v-list-item>
    </template>
  </v-list>
</template>
