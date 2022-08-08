<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const roomStore = useRoomStore();
const { members } = storeToRefs(roomStore);
const membersCount = computed(() => members.value.length);
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col class="text-subtitle-2" font="bold">Members—{{ membersCount }}</v-col>
    </v-row>
  </v-container>
</template>
