<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoomDialogStore } from "@/store/message/room/dialog";

interface Props {
  roomId: RoomInMessage["id"];
}

defineProps<Props>();
const roomDialogStore = useRoomDialogStore();
const { inviteRoomId } = storeToRefs(roomDialogStore);
</script>

<template>
  <UiIconButton
    label="Edit invite link"
    :meaning="UiIconMeaning.Edit"
    :variant="UiButtonVariant.Quiet"
    @click="inviteRoomId = roomId"
  />
</template>
