<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { MESSAGES_PATH } from "@/util/constants";

const roomStore = useRoomStore();
</script>

<template>
  <v-list lines="two">
    <v-list-item
      v-for="room in roomStore.filteredRoomList"
      :key="room.id"
      :active="roomStore.currentRoomId === room.id"
      :title="room.name"
      :subtitle="room.subtitle"
      @click="navigateTo(MESSAGES_PATH(room.id))"
    >
      <template #prepend>
        <v-list-item-avatar><v-img :src="room.avatar" /></v-list-item-avatar>
      </template>
    </v-list-item>
  </v-list>
</template>
