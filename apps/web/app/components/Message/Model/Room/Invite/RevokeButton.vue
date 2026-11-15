<script setup lang="ts">
import type { InviteInMessage } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useRoomInviteDialogStore } from "#src/store/message/room/roomInviteDialog";

interface Props {
  id: InviteInMessage["id"];
}

defineProps<Props>();
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
