<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useForwardStore } from "@/store/message/input/forward";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const forwardStore = useForwardStore();
const { roomIds } = storeToRefs(forwardStore);
const roomName = useRoomName(() => room.id);
const checkboxId = useId();
const isSelected = computed({
  get: () => roomIds.value.includes(room.id),
  set: (value) => {
    roomIds.value = value ? [...roomIds.value, room.id] : roomIds.value.filter((roomId) => roomId !== room.id);
  },
});
</script>

<!-- The whole row names its checkbox, so a press anywhere on the room picks it -->
<template>
  <label ui-item :for="checkboxId">
    <UiItemContent :image="room.image ?? ''" :title="roomName">
      <template #append>
        <UiCheckbox :id="checkboxId" v-model="isSelected" :label="`Forward to ${roomName}`" />
      </template>
    </UiItemContent>
  </label>
</template>
