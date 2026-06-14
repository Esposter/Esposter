<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { AdminActionListItemPropsMap } from "@/services/message/moderation/AdminActionListItemPropsMap";
import { AdminActionType } from "@esposter/db-schema";

interface BanDialogProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<BanDialogProps>();
const executeAdminAction = useExecuteAdminAction();
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title: 'Ban User', text: `Are you sure you want to ban ${user.name}?` }"
    :confirm-button-props="{ text: 'Ban' }"
    @delete="
      (onComplete) =>
        executeAdminAction((roomId) => ({ roomId, targetUserId: user.id, type: AdminActionType.CreateBan }), onComplete)
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item :="AdminActionListItemPropsMap[AdminActionType.CreateBan]" @click.stop="updateIsOpen(true)" />
    </template>
  </StyledDeleteFormDialog>
</template>
