<script setup lang="ts">
import { ChatRoom } from "@components/Chat/types";

interface Props {
  chatRooms: ChatRoom[];
}

const { chatRooms } = defineProps<Props>();
const selectedRoomIndex = 2;
</script>

<template>
  <v-list lines="two">
    <template v-for="(room, index) in chatRooms" :key="room.title">
      <v-list-item :active="selectedRoomIndex === index" :title="room.title" :subtitle="room.subtitle">
        <template #prepend>
          <v-list-item-avatar>
            <v-img :src="room.avatar" />
          </v-list-item-avatar>
        </template>
        <template #append>
          <v-badge color="green" dot />
        </template>
      </v-list-item>
      <v-divider v-if="index < chatRooms.length - 1" />
    </template>
  </v-list>
</template>
