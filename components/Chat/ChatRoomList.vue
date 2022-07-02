<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { MESSAGES_PATH } from "@/util/constants";

const { currentRoomId, roomList } = useRoomStore();
</script>

<template>
  <v-list lines="two">
    <v-list-item
      v-for="room in roomList"
      :key="room.id"
      :active="currentRoomId === room.id"
      :title="room.name"
      :subtitle="room.subtitle"
      @click="navigateTo(MESSAGES_PATH(room.id))"
    >
      <template #prepend>
        <v-badge class="mt-1 mr-4" color="green" location="bottom end" dot>
          <v-list-item-avatar>
            <v-img :src="room.avatar" :alt="room.name" />
          </v-list-item-avatar>
        </v-badge>
      </template>
    </v-list-item>
  </v-list>
</template>
