<script setup lang="ts">
import { ChatRoom } from "@components/Chat/types";

interface Props {
  chatRooms: ChatRoom[];
}

const { chatRooms } = defineProps<Props>();
const activeRoomIndex = ref(0);
</script>

<template>
  <v-list lines="two">
    <template v-for="(room, index) in chatRooms" :key="room.title">
      <v-list-item
        :active="activeRoomIndex === index"
        :title="room.title"
        :subtitle="room.subtitle"
        @click="activeRoomIndex = index"
      >
        <template #prepend>
          <v-badge color="green" dot>
            <v-list-item-avatar><v-img :src="room.avatar" /></v-list-item-avatar>
          </v-badge>
        </template>
      </v-list-item>
    </template>
  </v-list>
</template>
