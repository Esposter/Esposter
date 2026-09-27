<script setup lang="ts">
import type { InviteInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoomInviteDialogStore } from "@/store/message/room/roomInviteDialog";

interface Props {
  id: InviteInMessage["id"];
}

const { id } = defineProps<Props>();
const roomInviteDialogStore = useRoomInviteDialogStore();
const { revokingId } = storeToRefs(roomInviteDialogStore);
</script>

<template>
  <UiIconButton
    label="Revoke invite"
    :meaning="UiIconMeaning.Delete"
    :variant="UiButtonVariant.Quiet"
    @click="revokingId = id"
  />
</template>
