<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const isOpen = ref(false);
</script>

<template>
  <UiIconButton
    label="Add People"
    :meaning="UiIconMeaning.Invite"
    :variant="UiButtonVariant.Quiet"
    @click="isOpen = true"
  />
  <MessageContentHeaderCreateDirectMessageParticipantDialog v-model="isOpen" :room-id />
</template>
