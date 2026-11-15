<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

interface Props {
  roomId: RoomInMessage["id"];
}

defineProps<Props>();
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
