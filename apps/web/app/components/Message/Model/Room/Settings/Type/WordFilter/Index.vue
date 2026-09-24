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
  <div py-4 flex flex-col gap-6 ui-body>
    <!-- The form's own shape while the filter is read: the words' field, then the action's track -->
    <template v-if="isPending">
      <UiSkeleton h-8 />
      <UiSkeleton h-8 w="1/2" />
    </template>
    <UiErrorState v-else-if="error" :error @retry="refresh()" />
    <MessageModelRoomSettingsTypeWordFilterForm v-else :key="room.id" :room-id="room.id" :filter />
  </div>
</template>
