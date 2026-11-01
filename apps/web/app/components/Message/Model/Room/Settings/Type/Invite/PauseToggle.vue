<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  room: RoomInMessage;
}

const { room } = defineProps<Props>();
const saveRoom = useSaveRoom(() => room);
</script>

<template>
  <UiButton v-if="room.isInvitePaused" :variant="UiButtonVariant.Accent" @click="saveRoom({ isInvitePaused: false })">
    Enable invites
  </UiButton>
  <UiButton v-else :variant="UiButtonVariant.Danger" @click="saveRoom({ isInvitePaused: true })">
    Pause invites
  </UiButton>
</template>
