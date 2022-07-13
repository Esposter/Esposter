<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const roomStore = useRoomStore();
const { members } = storeToRefs(roomStore);
</script>

<template>
  <v-list>
    <v-list-item v-for="member in members" :key="member.id" @click="">
      <template #prepend>
        <v-badge m="r-4" color="green" location="bottom end" dot>
          <v-list-item-avatar>
            <v-img :src="member.avatar" :alt="member.username" />
          </v-list-item-avatar>
        </v-badge>
      </template>
      {{ member.username }}
    </v-list-item>
  </v-list>
</template>
