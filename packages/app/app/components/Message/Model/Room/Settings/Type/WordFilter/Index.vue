<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { data: filter } = useQuery(() => $trpc.room.filter.readRoomFilter.query({ roomId: room.id }));
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div font-bold text-title-medium>Word Filter</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" sm="8">
        <MessageModelRoomSettingsTypeWordFilterForm
          v-if="filter !== undefined"
          :key="room.id"
          :room-id="room.id"
          :filter
        />
      </v-col>
    </v-row>
  </v-container>
</template>
