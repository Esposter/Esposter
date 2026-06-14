<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { AdminActionListItemPropsMap } from "@/services/message/moderation/AdminActionListItemPropsMap";
import { AdminActionType } from "@esposter/db-schema";

interface WarnDialogProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<WarnDialogProps>();
const executeAdminAction = useExecuteAdminAction();
const reason = ref("");
</script>

<template>
  <StyledFormDialog
    :card-props="{ title: `Warn ${user.name}` }"
    :confirm-button-props="{ color: 'warning', text: 'Warn' }"
    @submit="
      (_event, onComplete) =>
        executeAdminAction(
          (roomId) => ({ reason, roomId, targetUserId: user.id, type: AdminActionType.Warn }),
          onComplete,
        )
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
