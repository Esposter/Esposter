<script setup lang="ts">
import type { InviteInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useRoomStore } from "#src/store/message/room/index";

interface Props {
  code: InviteInMessage["id"];
}

defineProps<Props>();
const roomStore = useRoomStore();
const { isJoinRoomPending } = storeToRefs(roomStore);
const { joinRoom } = roomStore;
</script>

<template>
  <UiButton :is-pending="isJoinRoomPending" w-full :variant="UiButtonVariant.Accent" @click="joinRoom(code)">
    Accept Invite
  </UiButton>
</template>
