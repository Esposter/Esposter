<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { AdminActionListItemPropsMap } from "@/services/message/moderation/AdminActionListItemPropsMap";
import { AdminActionType } from "@esposter/db-schema";

interface KickDialogProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<KickDialogProps>();
const executeAdminAction = useExecuteAdminAction();
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Kick Member', text: `Are you sure you want to kick ${user.name}?` }"
    :confirm-button-props="{ text: 'Kick' }"
    @delete="
      (onComplete) =>
        executeAdminAction(
          (roomId) => ({ roomId, targetUserId: user.id, type: AdminActionType.KickFromRoom }),
          onComplete,
        )
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item :="AdminActionListItemPropsMap[AdminActionType.KickFromRoom]" @click.stop="updateIsOpen(true)" />
    </template>
  </StyledDeleteFormDialog>
</template>
