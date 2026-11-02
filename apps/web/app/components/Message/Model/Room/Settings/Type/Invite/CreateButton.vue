<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomDialogStore } from "@/store/message/room/dialog";
import { useRoleStore } from "@/store/message/room/role";
import { RoomPermission } from "@esposter/db-schema";

interface Props {
  roomId: RoomInMessage["id"];
}

const { roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { checkHasMyPermission } = roleStore;
const roomDialogStore = useRoomDialogStore();
const { inviteRoomId } = storeToRefs(roomDialogStore);
</script>

<!-- The panel is gated on ManageRoom, but the invite it opens is minted under ManageInvites alone, so the create is
     offered only to a reader who holds that -->
<template>
  <UiButton v-if="checkHasMyPermission(roomId, RoomPermission.ManageInvites)" @click="inviteRoomId = roomId">
    Create invite
  </UiButton>
</template>
