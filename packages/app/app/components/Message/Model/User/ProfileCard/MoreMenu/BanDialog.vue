<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { withFinalizer } from "#shared/error/withFinalizer";
import { AdminActionListItemPropsMap } from "@/services/message/moderation/AdminActionListItemPropsMap";
import { useRoomStore } from "@/store/message/room";
import { AdminActionType } from "@esposter/db-schema";

interface BanDialogProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<BanDialogProps>();
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Ban User', text: `Are you sure you want to ban ${user.name}?` }"
    :confirm-button-props="{ text: 'Ban' }"
    @delete="
      async (onComplete) => {
        await withFinalizer(async () => {
          if (!currentRoom) return;
          await $trpc.moderation.executeAdminAction.mutate({
            roomId: currentRoom.id,
            targetUserId: user.id,
            type: AdminActionType.CreateBan,
          });
        }, onComplete);
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item :="AdminActionListItemPropsMap[AdminActionType.CreateBan]" @click.stop="updateIsOpen(true)" />
    </template>
  </StyledDeleteFormDialog>
</template>
