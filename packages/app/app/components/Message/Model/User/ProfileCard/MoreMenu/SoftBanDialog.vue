<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { withFinalizer } from "#shared/error/withFinalizer";
import { AdminActionListItemPropsMap } from "@/services/message/moderation/AdminActionListItemPropsMap";
import { useRoomStore } from "@/store/message/room";
import { AdminActionType } from "@esposter/db-schema";

interface SoftBanDialogProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<SoftBanDialogProps>();
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{
      title: 'Soft Ban Member',
      text: `Are you sure you want to soft-ban ${user.name}? They will be kicked and their recent messages deleted, but can rejoin via invite.`,
    }"
    :confirm-button-props="{ text: 'Soft Ban' }"
    @delete="
      async (onComplete) => {
        await withFinalizer(async () => {
          if (!currentRoom) return;
          await $trpc.moderation.executeAdminAction.mutate({
            roomId: currentRoom.id,
            targetUserId: user.id,
            type: AdminActionType.SoftBan,
          });
        }, onComplete);
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item :="AdminActionListItemPropsMap[AdminActionType.SoftBan]" @click.stop="updateIsOpen(true)" />
    </template>
  </StyledDeleteFormDialog>
</template>
