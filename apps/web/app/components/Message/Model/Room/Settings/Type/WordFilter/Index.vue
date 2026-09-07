<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const { $trpc } = useNuxtApp();
// The form initialises from `filter`, and a rejected read leaves that undefined exactly as a room with no
// Filter row does — so the read is gated on the error too, or a failure renders the defaults and the next
// Save writes them over the filter the room actually has
const {
  data: filter,
  error,
  isPending,
  refresh,
} = useQuery(() => $trpc.room.filter.readRoomFilter.query({ roomId: room.id }), { isInlineError: true });
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
        <StyledSkeleton v-if="isPending" type="list-item@4" />
        <StyledErrorState v-else-if="error" :error @retry="refresh()" />
        <MessageModelRoomSettingsTypeWordFilterForm v-else :key="room.id" :room-id="room.id" :filter />
      </v-col>
    </v-row>
  </v-container>
</template>
