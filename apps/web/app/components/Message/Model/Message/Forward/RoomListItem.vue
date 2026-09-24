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
const isSelected = computed({
  get: () => roomIds.value.includes(room.id),
  set: (value) => {
    roomIds.value = value ? [...roomIds.value, room.id] : roomIds.value.filter((roomId) => roomId !== room.id);
  },
});
</script>

<!-- The whole row names its checkbox, so a press anywhere on the room picks it -->
<template>
  <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -- the checkbox inside is the control this label names -->
  <label ui-item>
    <UiItemContent :image="room.image ?? ''" :title="roomName">
      <template #append>
        <UiCheckbox v-model="isSelected" :label="`Forward to ${roomName}`" />
      </template>
    </UiItemContent>
  </label>
</template>
