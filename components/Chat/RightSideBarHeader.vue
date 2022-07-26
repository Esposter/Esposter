<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const { members } = useRoomStore();
const membersCount = computed(() => members.length);
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col class="text-body" font="bold">Members—{{ membersCount }}</v-col>
    </v-row>
  </v-container>
</template>
