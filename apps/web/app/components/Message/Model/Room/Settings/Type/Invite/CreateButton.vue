<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomDialogStore } from "@/store/message/room/dialog";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const roomDialogStore = useRoomDialogStore();
const { inviteRoomId } = storeToRefs(roomDialogStore);
</script>

<template>
  <UiButton @click="inviteRoomId = roomId">Create invite</UiButton>
</template>
