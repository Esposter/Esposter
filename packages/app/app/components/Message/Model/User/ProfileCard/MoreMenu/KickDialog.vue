<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { AdminActionListItemPropsMap } from "@/services/message/moderation/AdminActionListItemPropsMap";
import { useRoomStore } from "@/store/message/room";
import { AdminActionType } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

interface KickDialogProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<KickDialogProps>();
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Kick Member', text: `Are you sure you want to kick ${user.name}?` }"
    :confirm-button-props="{ text: 'Kick' }"
    @delete="
      async (onComplete) => {
        await withFinalizerAsync(async () => {
          if (!currentRoom) return;
          await $trpc.message.moderation.executeAdminAction.mutate({
            roomId: currentRoom.id,
            targetUserId: user.id,
            type: AdminActionType.KickFromRoom,
          });
        }, onComplete);
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item :="AdminActionListItemPropsMap[AdminActionType.KickFromRoom]" @click.stop="updateIsOpen(true)" />
    </template>
  </StyledDeleteFormDialog>
</template>
