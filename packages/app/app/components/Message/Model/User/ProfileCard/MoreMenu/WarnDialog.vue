<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { AdminActionListItemPropsMap } from "@/services/message/moderation/AdminActionListItemPropsMap";
import { useRoomStore } from "@/store/message/room";
import { AdminActionType } from "@esposter/db-schema";
import { withFinalizerAsync } from "@esposter/shared";

interface WarnDialogProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<WarnDialogProps>();
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const reason = ref("");
</script>

<template>
  <StyledFormDialog
    :card-props="{ title: `Warn ${user.name}` }"
    :confirm-button-props="{ color: 'warning', text: 'Warn' }"
    @submit="
      async (_event, onComplete) => {
        await withFinalizerAsync(async () => {
          if (!currentRoom) return;
          await $trpc.message.moderation.executeAdminAction.mutate({
            reason,
            roomId: currentRoom.id,
            targetUserId: user.id,
            type: AdminActionType.Warn,
          });
        }, onComplete);
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item :="AdminActionListItemPropsMap[AdminActionType.Warn]" @click.stop="updateIsOpen(true)" />
    </template>
    <div px-4 py-2>
      <v-text-field v-model="reason" label="Reason (optional)" hint="Visible in the audit log" persistent-hint />
    </div>
  </StyledFormDialog>
</template>
